/**
 * SQLite connection + schema, replacing the original Mongo connection in
 * app/extensions.py. Table columns mirror the fields that used to live on
 * the Mongo `users` / `events` / `labeled_training_data` documents, so the
 * route/service logic maps over almost 1:1.
 */
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

let db = null;

function initDb(config) {
  const sqlitePath = config.SQLITE_PATH;
  const dir = path.dirname(sqlitePath);
  if (dir && dir !== "." && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(sqlitePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      platform TEXT,
      password_hash TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      site_id TEXT UNIQUE,
      otp_hash TEXT,
      otp_expires_at TEXT,
      otp_attempts INTEGER NOT NULL DEFAULT 0,
      otp_last_sent_at TEXT,
      created_at TEXT NOT NULL,
      verified_at TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      type TEXT NOT NULL,
      ip TEXT,
      device_id TEXT,
      url TEXT,
      referrer TEXT,
      device_browser TEXT,
      device_os TEXT,
      device_is_mobile INTEGER NOT NULL DEFAULT 0,
      device_is_bot_ua INTEGER NOT NULL DEFAULT 0,
      time_on_page_ms INTEGER,
      max_scroll_pct INTEGER,
      client_time TEXT,
      label TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_site_created
      ON events (site_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_site_ip_created
      ON events (site_id, ip, created_at DESC);

    CREATE TABLE IF NOT EXISTS labeled_training_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT,
      ip TEXT,
      device_id TEXT,
      label TEXT,
      confirmed INTEGER NOT NULL DEFAULT 0,
      source TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ltd_site_created
      ON labeled_training_data (site_id, created_at DESC);
  `);

  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialised — call initDb(config) first.");
  }
  return db;
}

module.exports = { initDb, getDb };
