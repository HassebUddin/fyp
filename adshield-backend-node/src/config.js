require("dotenv").config();

function toBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") return defaultValue;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

const config = {
  // --- Core ---
  SECRET_KEY: process.env.SECRET_KEY || "dev-secret-change-me",
  DEBUG: toBool(process.env.DEBUG, true),
  ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),

  // --- SQLite ---
  SQLITE_PATH: process.env.SQLITE_PATH || "./data/adshield.sqlite",

  // --- JWT ---
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "dev-jwt-secret-change-me",
  JWT_EXPIRES_DAYS: parseInt(process.env.JWT_EXPIRES_DAYS || "7", 10),

  // --- OTP ---
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || "6", 10),
  OTP_TTL_MINUTES: parseInt(process.env.OTP_TTL_MINUTES || "10", 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10),
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || "45", 10),

  // --- Email (SMTP) ---
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USERNAME: process.env.SMTP_USERNAME || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  SMTP_USE_TLS: toBool(process.env.SMTP_USE_TLS, true),
  MAIL_FROM: process.env.MAIL_FROM || "AdShield AI <no-reply@adshield.ai>",
  // When no SMTP credentials are configured, emails are logged to the
  // console instead of sent, so the API can still be developed/demoed
  // without a real mailbox. Never enable this in production.
  EMAIL_DEV_FALLBACK: toBool(process.env.EMAIL_DEV_FALLBACK, true),

  // --- CORS ---
  // The dashboard frontend origin(s) — comma separated. Tracking endpoints
  // (/tracker.js, /api/collect) are intentionally open to any origin below,
  // since they must work when embedded on any client's storefront domain.
  DASHBOARD_ORIGINS: (process.env.DASHBOARD_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // --- Fraud heuristics (placeholder rules; swap for the trained
  // ensemble model in the FYP2 milestone) ---
  SUSPICIOUS_CLICK_WINDOW_SECONDS: parseInt(process.env.SUSPICIOUS_CLICK_WINDOW_SECONDS || "600", 10),
  SUSPICIOUS_CLICK_THRESHOLD: parseInt(process.env.SUSPICIOUS_CLICK_THRESHOLD || "5", 10),

  // --- Public base URL, used when generating the tracking snippet ---
  PUBLIC_API_URL: process.env.PUBLIC_API_URL || "http://localhost:5000",
};

module.exports = config;
