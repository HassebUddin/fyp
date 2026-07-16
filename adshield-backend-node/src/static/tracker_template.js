/*!
 * AdShield AI tracking script.
 * Framework-agnostic by design: plain JS, no dependencies, works the same
 * way on Shopify, WooCommerce, WordPress, or a hand-written HTML page —
 * exactly like a Google Analytics snippet.
 */
(function () {
  "use strict";

  var API_BASE = "__API_BASE__";
  var SITE_ID = "__SITE_ID__";
  var COLLECT_URL = API_BASE + "/api/collect";
  var DEVICE_KEY = "_adshield_device_id";

  // ---- persistent (per-browser) device id -------------------------------
  function getDeviceId() {
    try {
      var existing = localStorage.getItem(DEVICE_KEY);
      if (existing) return existing;
      var id =
        "d-" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 12);
      localStorage.setItem(DEVICE_KEY, id);
      return id;
    } catch (e) {
      // localStorage blocked (private mode etc.) — fall back to a
      // session-only id rather than failing tracking entirely.
      return "no-storage-" + Math.random().toString(36).slice(2, 12);
    }
  }

  // ---- lightweight fingerprint signals -----------------------------------
  function collectFingerprint() {
    return {
      device_id: getDeviceId(),
      screen: screen.width + "x" + screen.height,
      color_depth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      platform: navigator.platform || "",
      user_agent: navigator.userAgent || "",
    };
  }

  function send(payload, useBeacon) {
    payload.site_id = SITE_ID;
    payload.url = location.href;
    payload.referrer = document.referrer || "";
    payload.client_time = new Date().toISOString();

    var body = JSON.stringify(payload);
    if (useBeacon && navigator.sendBeacon) {
      var blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(COLLECT_URL, blob);
      return;
    }
    fetch(COLLECT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      keepalive: true,
    }).catch(function () {
      /* fail silently — never break the host site */
    });
  }

  // ---- Layer 1: honeypot trap --------------------------------------------
  // Invisible link, hidden with CSS (not "display:none", which some bots
  // skip) so it never renders for a human but still sits in the raw HTML
  // for anything crawling the DOM.
  function injectHoneypot() {
    var link = document.createElement("a");
    link.href = "#";
    link.rel = "nofollow";
    link.setAttribute("aria-hidden", "true");
    link.tabIndex = -1;
    link.style.position = "absolute";
    link.style.left = "-9999px";
    link.style.top = "-9999px";
    link.style.width = "1px";
    link.style.height = "1px";
    link.style.overflow = "hidden";
    link.addEventListener("click", function (e) {
      e.preventDefault();
      send(Object.assign({ type: "honeypot_hit" }, collectFingerprint()), true);
    });
    document.body.appendChild(link);
  }

  // ---- pageview -----------------------------------------------------------
  function trackPageview() {
    send(Object.assign({ type: "pageview" }, collectFingerprint()), false);
  }

  // ---- basic session signal (time on page, scroll depth) ------------------
  function trackSessionOnExit() {
    var start = Date.now();
    var maxScroll = 0;

    function updateScroll() {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      if (scrollable > 0) {
        var pct = Math.round((window.scrollY / scrollable) * 100);
        if (pct > maxScroll) maxScroll = Math.min(pct, 100);
      }
    }
    window.addEventListener("scroll", updateScroll, { passive: true });

    function sendExit() {
      send(
        Object.assign(
          {
            type: "session_update",
            device_id: getDeviceId(),
            time_on_page_ms: Date.now() - start,
            max_scroll_pct: maxScroll,
          }
        ),
        true
      );
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") sendExit();
    });
    window.addEventListener("pagehide", sendExit);
  }

  function init() {
    injectHoneypot();
    trackPageview();
    trackSessionOnExit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
