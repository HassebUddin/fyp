/**
 * Fraud scoring for incoming traffic events.
 *
 * Two layers, matching the proposal:
 *
 * Layer 1 — Honeypot: absolute. Anything that fires the honeypot event is a
 * confirmed bot, no scoring needed. Every honeypot hit is also copied into
 * `labeled_training_data` as a confirmed-fraud row, which is exactly the
 * reliably-labeled dataset the proposal's ML section is built on.
 *
 * Layer 2 — Behaviour: for FYP1, a simple, transparent rule-based stand-in
 * (same-IP click frequency in a rolling window) rather than the trained
 * XGBoost + Isolation Forest + Neural Network ensemble planned for FYP2.
 * `scoreEvent()` is the single seam to swap in the real model later —
 * nothing calling it needs to change.
 */

/** Confirmed bot: label immediately and add to the training dataset. */
function recordHoneypotHit(db, event) {
  db.prepare(
    `INSERT INTO labeled_training_data (site_id, ip, device_id, label, confirmed, source, created_at)
     VALUES (?, ?, ?, 'bot', 1, 'honeypot', ?)`
  ).run(event.site_id, event.ip, event.device_id || null, new Date().toISOString());
}

/**
 * Returns one of: "bot", "suspicious", "legit".
 * `event` must already contain site_id, ip, and type.
 */
function scoreEvent(db, config, event) {
  if (event.type === "honeypot_hit") {
    return "bot";
  }

  // Known crawler / automation UAs (Googlebot, curl, headless, etc.)
  if (event.device?.is_bot_ua) {
    return "bot";
  }

  const windowSeconds = config.SUSPICIOUS_CLICK_WINDOW_SECONDS;
  const threshold = config.SUSPICIOUS_CLICK_THRESHOLD;
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const row = db
    .prepare(
      `SELECT COUNT(*) AS count FROM events WHERE site_id = ? AND ip = ? AND created_at >= ?`
    )
    .get(event.site_id, event.ip, since);

  if (row.count >= threshold) {
    return "suspicious";
  }
  return "legit";
}

module.exports = { recordHoneypotHit, scoreEvent };
