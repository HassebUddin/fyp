const fs = require("fs");
const path = require("path");
const express = require("express");
const { UAParser } = require("ua-parser-js");
const { getDb } = require("../db");
const { recordHoneypotHit, scoreEvent } = require("../services/fraudService");
const { getClientIp, hashFingerprint } = require("../utils/security");

const TEMPLATE_PATH = path.join(__dirname, "..", "static", "tracker_template.js");
const VALID_EVENT_TYPES = new Set(["pageview", "honeypot_hit", "session_update"]);

// ua-parser-js has no built-in bot classifier (unlike Python's `user-agents`
// library, which flags common crawler/bot strings) — this regex reproduces
// that same "is this UA a bot" signal.
const BOT_UA_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|curl|wget|python-requests|headlesschrome|phantomjs/i;

function parseUserAgent(uaString) {
  const result = new UAParser(uaString || "").getResult();
  const isBot = BOT_UA_RE.test(uaString || "");
  const isMobile = result.device.type === "mobile";
  return {
    browser: result.browser.name || "Other",
    os: result.os.name || "Other",
    is_mobile: isMobile,
    is_bot_ua: isBot,
  };
}

function buildTrackingRouter(config, io) {
  const router = express.Router();
  const db = getDb();

  /**
   * Public, unauthenticated: this is what a client pastes into their store,
   * so it must be fetchable from any domain with no auth. The site_id is
   * baked into the returned script and is not a secret — it only identifies
   * which dashboard events should be attributed to.
   */
  router.get("/tracker.js", (req, res) => {
    const siteId = req.query.site_id || "";
    const user = siteId
      ? db.prepare("SELECT * FROM users WHERE site_id = ? AND status = 'verified'").get(siteId)
      : null;

    if (!user) {
      res.status(404).type("application/javascript");
      return res.send("console.warn('AdShield AI: unknown site_id');");
    }

    let script = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    script = script.replace("__API_BASE__", config.PUBLIC_API_URL);
    script = script.replace("__SITE_ID__", siteId);

    res.set("Cache-Control", "public, max-age=300");
    res.type("application/javascript");
    return res.send(script);
  });

  /**
   * Receives pageview / honeypot_hit / session_update events from the
   * tracking script on any client website. No auth — the script runs on
   * visitors' browsers, not on our own frontend — but every event must
   * carry a valid, verified site_id.
   */
  router.post("/api/collect", (req, res) => {
    const data = req.body || {};
    const siteId = data.site_id || "";
    const eventType = data.type || "";

    if (!VALID_EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ error: "Unknown event type." });
    }

    const user = db.prepare("SELECT * FROM users WHERE site_id = ? AND status = 'verified'").get(siteId);
    if (!user) {
      return res.status(404).json({ error: "Unknown site_id." });
    }

    const ip = getClientIp(req);
    const uaString = data.user_agent || req.headers["user-agent"] || "";
    const ua = parseUserAgent(uaString);

    const fingerprintComponents = {
      screen: data.screen,
      timezone: data.timezone,
      language: data.language,
      platform: data.platform,
      color_depth: data.color_depth,
      user_agent: uaString,
    };
    const deviceId = data.device_id || hashFingerprint(fingerprintComponents);

    const createdAt = new Date().toISOString();
    const event = {
      site_id: siteId,
      type: eventType,
      ip,
      device_id: deviceId,
      url: data.url || "",
      referrer: data.referrer || "",
      device: {
        browser: ua.browser,
        os: ua.os,
        is_mobile: ua.is_mobile,
        is_bot_ua: ua.is_bot_ua,
      },
      time_on_page_ms: data.time_on_page_ms ?? null,
      max_scroll_pct: data.max_scroll_pct ?? null,
      client_time: data.client_time || null,
      created_at: createdAt,
    };

    const label = scoreEvent(db, config, event);
    event.label = label;

    db.prepare(
      `INSERT INTO events
         (site_id, type, ip, device_id, url, referrer, device_browser, device_os,
          device_is_mobile, device_is_bot_ua, time_on_page_ms, max_scroll_pct, client_time, label, created_at)
       VALUES (@site_id, @type, @ip, @device_id, @url, @referrer, @device_browser, @device_os,
               @device_is_mobile, @device_is_bot_ua, @time_on_page_ms, @max_scroll_pct, @client_time, @label, @created_at)`
    ).run({
      site_id: event.site_id,
      type: event.type,
      ip: event.ip,
      device_id: event.device_id,
      url: event.url,
      referrer: event.referrer,
      device_browser: event.device.browser,
      device_os: event.device.os,
      device_is_mobile: event.device.is_mobile ? 1 : 0,
      device_is_bot_ua: event.device.is_bot_ua ? 1 : 0,
      time_on_page_ms: event.time_on_page_ms,
      max_scroll_pct: event.max_scroll_pct,
      client_time: event.client_time,
      label: event.label,
      created_at: event.created_at,
    });

    if (eventType === "honeypot_hit") {
      recordHoneypotHit(db, event);
    }

    // Push to any connected dashboard for this site so the live feed
    // updates without polling.
    io.to(`site:${siteId}`).emit("new_event", {
      type: event.type,
      label,
      ip,
      url: event.url,
      device: event.device,
      created_at: event.created_at,
    });

    return res.status(201).json({ status: "ok", label });
  });

  return router;
}

module.exports = buildTrackingRouter;
