const express = require("express");
const { getDb } = require("../db");
const { jwtRequired } = require("../utils/jwt");

// Placeholder — until real campaign cost data is wired up (Google Ads API
// integration is an FYP2 milestone), we estimate budget saved as caught
// fraudulent clicks times an average cost-per-click.
const ASSUMED_AVG_CPC_USD = 0.35;

function currentSiteId(db, email) {
  const user = db.prepare("SELECT site_id FROM users WHERE email = ?").get(email);
  return user ? user.site_id : null;
}

function eventRowToObject(row) {
  return {
    site_id: row.site_id,
    type: row.type,
    ip: row.ip,
    device_id: row.device_id,
    url: row.url,
    referrer: row.referrer,
    device: {
      browser: row.device_browser,
      os: row.device_os,
      is_mobile: !!row.device_is_mobile,
      is_bot_ua: !!row.device_is_bot_ua,
    },
    time_on_page_ms: row.time_on_page_ms,
    max_scroll_pct: row.max_scroll_pct,
    client_time: row.client_time,
    label: row.label,
    created_at: row.created_at,
  };
}

function buildDashboardRouter(config) {
  const router = express.Router();
  const db = getDb();

  router.get("/script", jwtRequired(config), (req, res) => {
    const siteId = currentSiteId(db, req.jwtIdentity);
    if (!siteId) {
      return res.status(404).json({ error: "No site found for this account." });
    }
    const base = config.PUBLIC_API_URL;
    const snippet = `<script src="${base}/tracker.js?site_id=${siteId}" async></script>`;
    return res.json({
      siteId,
      snippet,
      scriptUrl: `${base}/tracker.js?site_id=${siteId}`,
    });
  });

  router.get("/summary", jwtRequired(config), (req, res) => {
    const siteId = currentSiteId(db, req.jwtIdentity);
    if (!siteId) {
      return res.status(404).json({ error: "No site found for this account." });
    }

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const countByLabel = (label) =>
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM events WHERE site_id = ? AND created_at >= ? AND label = ?`
        )
        .get(siteId, since24h, label).count;

    const legit = countByLabel("legit");
    const suspicious = countByLabel("suspicious");
    const bots = countByLabel("bot");

    const uniqueVisitors = db
      .prepare(
        `SELECT COUNT(DISTINCT device_id) AS count FROM events WHERE site_id = ? AND created_at >= ?`
      )
      .get(siteId, since24h).count;

    const hourly = db
      .prepare(
        `SELECT strftime('%H:00', created_at) AS hour, label, COUNT(*) AS count
         FROM events
         WHERE site_id = ? AND created_at >= ?
         GROUP BY hour, label`
      )
      .all(siteId, since24h);

    const seriesByHour = {};
    for (const row of hourly) {
      const hour = row.hour;
      seriesByHour[hour] = seriesByHour[hour] || { hour, legit: 0, suspicious: 0, bots: 0 };
      const key = row.label === "bot" ? "bots" : row.label;
      if (key === "legit" || key === "suspicious" || key === "bots") {
        seriesByHour[hour][key] = row.count;
      }
    }

    const series = Object.values(seriesByHour).sort((a, b) => a.hour.localeCompare(b.hour));

    return res.json({
      visitorsToday: uniqueVisitors,
      botsCaught: bots,
      suspiciousClicks: suspicious,
      legitClicks: legit,
      budgetSavedUsd: Math.round(bots * ASSUMED_AVG_CPC_USD * 100) / 100,
      series,
    });
  });

  router.get("/events", jwtRequired(config), (req, res) => {
    const siteId = currentSiteId(db, req.jwtIdentity);
    if (!siteId) {
      return res.status(404).json({ error: "No site found for this account." });
    }

    const rows = db
      .prepare(`SELECT * FROM events WHERE site_id = ? ORDER BY created_at DESC LIMIT 25`)
      .all(siteId);

    const events = rows.map(eventRowToObject);
    return res.json({ events });
  });

  return router;
}

module.exports = buildDashboardRouter;
