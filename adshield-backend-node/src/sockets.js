const { getDb } = require("./db");
const { decodeToken } = require("./utils/jwt");

/**
 * Dashboard clients call socket.emit('join', {siteId, token}) after
 * connecting, so live events for that site get pushed to them. The JWT
 * is checked here (not just accepted at face value) so one store can't
 * eavesdrop on another's traffic feed.
 */
function registerSocketHandlers(io, config) {
  const db = getDb();

  io.on("connection", (socket) => {
    socket.on("join", (data, callback) => {
      const cb = typeof callback === "function" ? callback : () => {};
      const siteId = (data || {}).siteId;
      const token = (data || {}).token;

      if (!siteId || !token) {
        return cb({ ok: false, error: "siteId and token are required." });
      }

      let decoded;
      try {
        decoded = decodeToken(config, token);
      } catch (e) {
        return cb({ ok: false, error: "Invalid or expired session." });
      }

      const email = decoded.sub;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || user.site_id !== siteId) {
        return cb({ ok: false, error: "Not authorised for this site." });
      }

      socket.join(`site:${siteId}`);
      return cb({ ok: true });
    });
  });
}

module.exports = registerSocketHandlers;
