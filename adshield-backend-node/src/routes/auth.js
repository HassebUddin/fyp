const express = require("express");
const { getDb } = require("../db");
const { sendOtpEmail } = require("../services/emailService");
const {
  checkPassword,
  generateOtp,
  generateSiteId,
  hashPassword,
  hashOtp,
} = require("../utils/security");
const { createAccessToken, jwtRequired } = require("../utils/jwt");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    storeName: user.store_name,
    email: user.email,
    platform: user.platform,
    siteId: user.site_id || null,
  };
}

function buildAuthRouter(config) {
  const router = express.Router();
  const db = getDb();

  router.post("/signup", async (req, res) => {
    const data = req.body || {};
    const storeName = (data.storeName || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const platform = (data.platform || "Other").trim();
    const password = data.password || "";

    if (!storeName) {
      return res.status(400).json({ error: "storeName is required." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existing && existing.status === "verified") {
      return res
        .status(409)
        .json({ error: "An account with this email already exists. Try logging in." });
    }

    const otp = generateOtp(config.OTP_LENGTH);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.OTP_TTL_MINUTES * 60 * 1000);

    const fields = {
      store_name: storeName,
      email,
      platform,
      password_hash: hashPassword(password),
      status: "pending",
      otp_hash: hashOtp(otp),
      otp_expires_at: expiresAt.toISOString(),
      otp_attempts: 0,
      otp_last_sent_at: now.toISOString(),
      created_at: now.toISOString(),
    };

    if (existing) {
      db.prepare(
        `UPDATE users SET store_name=?, email=?, platform=?, password_hash=?, status=?,
           otp_hash=?, otp_expires_at=?, otp_attempts=?, otp_last_sent_at=?, created_at=?
         WHERE email=?`
      ).run(
        fields.store_name,
        fields.email,
        fields.platform,
        fields.password_hash,
        fields.status,
        fields.otp_hash,
        fields.otp_expires_at,
        fields.otp_attempts,
        fields.otp_last_sent_at,
        fields.created_at,
        email
      );
    } else {
      db.prepare(
        `INSERT INTO users
           (store_name, email, platform, password_hash, status, otp_hash, otp_expires_at, otp_attempts, otp_last_sent_at, created_at)
         VALUES (@store_name, @email, @platform, @password_hash, @status, @otp_hash, @otp_expires_at, @otp_attempts, @otp_last_sent_at, @created_at)`
      ).run(fields);
    }

    try {
      await sendOtpEmail(config, email, storeName, otp);
    } catch (e) {
      console.error("Failed to send OTP email:", e.message);
    }

    // Local/dev: SMTP is empty, so OTP never hits a real inbox — return it
    // in the JSON so the verify screen can show it for testing.
    const payload = { message: "Verification code sent.", email };
    if (!config.SMTP_HOST && config.EMAIL_DEV_FALLBACK) {
      payload.devOtp = otp;
      payload.devHint = "SMTP not configured — use this code on the verify screen (local testing).";
    }
    return res.status(201).json(payload);
  });

  router.post("/verify-otp", (req, res) => {
    const data = req.body || {};
    const email = (data.email || "").trim().toLowerCase();
    const code = (data.code || "").trim();

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || user.status !== "pending") {
      return res.status(404).json({ error: "No pending verification for this email." });
    }

    if (user.otp_attempts >= config.OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: "Too many incorrect attempts. Request a new code." });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ error: "This code has expired. Request a new one." });
    }

    if (hashOtp(code) !== user.otp_hash) {
      db.prepare("UPDATE users SET otp_attempts = otp_attempts + 1 WHERE email = ?").run(email);
      return res
        .status(400)
        .json({ error: "That code doesn't match. Check your inbox and try again." });
    }

    const siteId = generateSiteId();
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE users SET status='verified', site_id=?, verified_at=?,
         otp_hash=NULL, otp_expires_at=NULL, otp_attempts=0
       WHERE email=?`
    ).run(siteId, now, email);

    const updatedUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    const token = createAccessToken(config, email);
    return res.status(200).json({ accessToken: token, user: publicUser(updatedUser) });
  });

  router.post("/resend-otp", async (req, res) => {
    const data = req.body || {};
    const email = (data.email || "").trim().toLowerCase();

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || user.status !== "pending") {
      return res.status(404).json({ error: "No pending verification for this email." });
    }

    const cooldown = config.OTP_RESEND_COOLDOWN_SECONDS;
    const lastSent = new Date(user.otp_last_sent_at);
    const elapsedSeconds = (Date.now() - lastSent.getTime()) / 1000;
    if (elapsedSeconds < cooldown) {
      return res.status(429).json({
        error: `Please wait ${Math.ceil(cooldown - elapsedSeconds)}s before requesting another code.`,
      });
    }

    const otp = generateOtp(config.OTP_LENGTH);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.OTP_TTL_MINUTES * 60 * 1000);
    db.prepare(
      `UPDATE users SET otp_hash=?, otp_expires_at=?, otp_last_sent_at=?, otp_attempts=0 WHERE email=?`
    ).run(hashOtp(otp), expiresAt.toISOString(), now.toISOString(), email);

    try {
      await sendOtpEmail(config, email, user.store_name, otp);
    } catch (e) {
      console.error("Failed to send OTP email:", e.message);
    }

    const payload = { message: "Verification code resent." };
    if (!config.SMTP_HOST && config.EMAIL_DEV_FALLBACK) {
      payload.devOtp = otp;
      payload.devHint = "SMTP not configured — use this code on the verify screen (local testing).";
    }
    return res.status(200).json(payload);
  });

  router.post("/login", (req, res) => {
    const data = req.body || {};
    const email = (data.email || "").trim().toLowerCase();
    const password = data.password || "";

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !checkPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }
    if (user.status !== "verified") {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in.", needsVerification: true });
    }

    const token = createAccessToken(config, email);
    return res.status(200).json({ accessToken: token, user: publicUser(user) });
  });

  router.get("/me", jwtRequired(config), (req, res) => {
    const email = req.jwtIdentity;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json({ user: publicUser(user) });
  });

  return router;
}

module.exports = buildAuthRouter;
