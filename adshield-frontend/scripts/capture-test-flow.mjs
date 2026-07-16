/**
 * Real-page test video for Haseeb's account:
 * dashboard → copy script → open store → dashboard counts change
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const backendJwt = require("c:/work/Haseeb/Mahad/adshield-backend-nodejs (1)/adshield-backend-node/node_modules/jsonwebtoken");

const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\test-flow-shots";
const BASE = "http://127.0.0.1:5173";
const API = "http://127.0.0.1:5000";
const STORE = "http://127.0.0.1:5500/";
const email = "haseeb@gmail.com";
const siteId = "8a0c8c9854024d36";
const storeName = "Haseeb Uddin";
const platform = "Other";

fs.mkdirSync(OUT, { recursive: true });

const token = backendJwt.sign({ sub: email }, "dev-jwt-secret-adshield-local", {
  expiresIn: "7d",
});

async function api(p, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${p}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shot(name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", name);
}

// Inject real session for Haseeb's account
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.evaluate(
  ([session]) => {
    localStorage.setItem("adshield_session", JSON.stringify(session));
  },
  [
    {
      accessToken: token,
      email,
      storeName,
      platform,
      siteId,
    },
  ]
);

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await shot("01-dashboard-start");

// Open Link your website panel
const linkBtn = page.locator("button").filter({ hasText: /Link your website|connected|Installed/i }).first();
if (await linkBtn.count()) await linkBtn.click().catch(() => {});
await page.waitForTimeout(600);
await shot("02-script-copy-yahan");

// Highlight copy
const copyBtn = page.getByRole("button", { name: /^Copy$/i });
if (await copyBtn.count()) {
  await copyBtn.click().catch(() => {});
  await page.waitForTimeout(400);
}
await shot("03-script-copied");

// Go to OTHER website (demo store with script)
await page.goto(STORE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await shot("04-dusri-website-visit");

// Extra visits so visitors/legit clearly move
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// Fire one honeypot bot for "Bots" explanation
await api("/api/collect", {
  method: "POST",
  body: {
    site_id: siteId,
    type: "honeypot_hit",
    url: STORE,
    referrer: "https://google.com/ads",
    user_agent: "python-requests/2.31.0",
    device_id: `bot-video-${Date.now()}`,
    client_time: new Date().toISOString(),
  },
});

// Back to dashboard — show change
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await shot("05-dashboard-after-visits");

await page.evaluate(() => window.scrollBy(0, 480));
await page.waitForTimeout(700);
await shot("06-live-feed-events");

await browser.close();
console.log("DONE");
