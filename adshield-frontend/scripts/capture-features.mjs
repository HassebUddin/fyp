/**
 * Short real-feature walkthrough: seed traffic + screenshot dashboard parts.
 */
import { chromium } from "playwright";
import fs from "fs";

const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\feature-shots";
const BASE = "http://127.0.0.1:5173";
const API = "http://127.0.0.1:5000";
fs.mkdirSync(OUT, { recursive: true });

const email = `feat${Date.now()}@adshield.local`;
const password = "Demo1234!";

async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${path}`);
  return data;
}

// 1) Signup + OTP
const signup = await api("/api/auth/signup", {
  method: "POST",
  body: { storeName: "Feature Demo Store", email, platform: "Shopify", password },
});
if (!signup.devOtp) throw new Error("No devOtp — backend SMTP fallback missing?");
const verified = await api("/api/auth/verify-otp", {
  method: "POST",
  body: { email, code: signup.devOtp },
});
const token = verified.accessToken;
const siteId = verified.user.siteId;
console.log("siteId", siteId);

// 2) Seed traffic so counts are NOT zero
async function collect(type, extra = {}) {
  await api("/api/collect", {
    method: "POST",
    body: {
      site_id: siteId,
      type,
      url: "https://demo-store.example/products/serum",
      referrer: "https://google.com/ads",
      user_agent: extra.ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      device_id: extra.device || `dev-${Math.random().toString(16).slice(2)}`,
      client_time: new Date().toISOString(),
      ...extra.fields,
    },
  });
}

// Legit pageviews (different devices)
for (let i = 0; i < 4; i++) await collect("pageview", { device: `legit-${i}` });
// Bot honeypot hits
for (let i = 0; i < 3; i++) {
  await collect("honeypot_hit", {
    device: `bot-${i}`,
    ua: "python-requests/2.31.0",
  });
}
// Suspicious: same IP/device many clicks quickly
for (let i = 0; i < 6; i++) {
  await collect("pageview", { device: "spam-clicker-1" });
}

const summary = await api("/api/dashboard/summary", { token });
console.log("summary", summary);

const script = await api("/api/dashboard/script", { token });
console.log("snippet", script.snippet);

// 3) Screenshots via Chrome
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 15000 });
await page.waitForTimeout(1800);

async function shot(name) {
  const file = `${OUT}\\${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", name);
}

await shot("01-dashboard-stats");

// Expand install snippet if collapsed
const linkBtn = page.getByRole("button", { name: /Link your website|Installed/i }).first();
if (await linkBtn.count()) {
  await linkBtn.click().catch(() => {});
  await page.waitForTimeout(400);
}
await shot("02-script-snippet");

await page.evaluate(() => window.scrollBy(0, 380));
await page.waitForTimeout(500);
await shot("03-radar-chart");

await page.evaluate(() => window.scrollBy(0, 420));
await page.waitForTimeout(500);
await shot("04-traffic-feed");

await browser.close();
fs.writeFileSync(`${OUT}\\meta.json`, JSON.stringify({ email, password, siteId, snippet: script.snippet, summary }, null, 2));
console.log("DONE");
