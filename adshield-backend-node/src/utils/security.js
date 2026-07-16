const crypto = require("crypto");
const bcrypt = require("bcryptjs");

function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, 10);
}

function checkPassword(plainPassword, hashed) {
  try {
    return bcrypt.compareSync(plainPassword, hashed);
  } catch (e) {
    return false;
  }
}

/** Cryptographically-random numeric OTP, e.g. '048213'. */
function generateOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

/** Short, URL-safe identifier embedded in the client's tracking script. */
function generateSiteId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

/**
 * Best-effort real client IP. Client sites sit behind our tracking script,
 * which calls this API directly from the visitor's browser, so the
 * request usually carries the visitor's own IP — but we still honour
 * X-Forwarded-For in case the request passes through a proxy/CDN.
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "0.0.0.0";
}

/**
 * Lightweight device fingerprint for FYP1: a stable hash of browser/device
 * signals sent by the tracking script (screen size, timezone, language,
 * platform, color depth, user agent). This is a stand-in for the
 * FingerprintJS-based fingerprinting planned for FYP2 — same purpose
 * (recognise a repeat visitor even if their IP changes), simpler source.
 */
function hashFingerprint(components) {
  const raw = Object.keys(components)
    .sort()
    .map((k) => String(components[k] ?? ""))
    .join("|");
  return crypto.createHash("sha256").update(raw, "utf-8").digest("hex").slice(0, 32);
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp, "utf-8").digest("hex");
}

module.exports = {
  hashPassword,
  checkPassword,
  generateOtp,
  generateSiteId,
  getClientIp,
  hashFingerprint,
  hashOtp,
};
