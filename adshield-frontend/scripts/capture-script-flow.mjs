/**
 * Video flow: copy script → paste on demo store → visit store → dashboard updates
 */
import { chromium } from "playwright";
import fs from "fs";
import http from "http";
import path from "path";

const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\script-flow-shots";
const DEMO_DIR = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\demo-store";
const BASE = "http://127.0.0.1:5173";
const API = "http://127.0.0.1:5000";
const STORE_PORT = 5500;

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(DEMO_DIR, { recursive: true });

async function api(p, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${p}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `${res.status} ${p}`);
  return data;
}

const email = `flow${Date.now()}@adshield.local`;
const password = "Demo1234!";

const signup = await api("/api/auth/signup", {
  method: "POST",
  body: { storeName: "My Online Store", email, platform: "Shopify", password },
});
const verified = await api("/api/auth/verify-otp", {
  method: "POST",
  body: { email, code: signup.devOtp },
});
const token = verified.accessToken;
const siteId = verified.user.siteId;
const scriptInfo = await api("/api/dashboard/script", { token });
const snippet = scriptInfo.snippet;
console.log("snippet:", snippet);

// BEFORE: empty store HTML (no script yet)
const beforeHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<title>My Online Store (BEFORE script)</title>
<style>
  body{font-family:Segoe UI,sans-serif;margin:0;background:#f6f3ee;color:#1a1a1a}
  header{background:#111;color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
  main{max-width:900px;margin:40px auto;padding:0 20px}
  .product{background:#fff;border:1px solid #ddd;border-radius:12px;padding:24px;display:grid;grid-template-columns:180px 1fr;gap:20px}
  .img{background:#e8e0d5;height:180px;border-radius:8px}
  .badge{display:inline-block;background:#ffe8a3;color:#7a5b00;padding:4px 10px;border-radius:999px;font-size:12px;margin-top:12px}
  .hint{margin-top:28px;padding:14px;border:2px dashed #bbb;border-radius:10px;color:#555;background:#fff}
</style>
</head>
<body>
<header><strong>My Online Store</strong><span>Cart (0)</span></header>
<main>
  <div class="product">
    <div class="img"></div>
    <div>
      <h1>Vitamin C Serum</h1>
      <p>Rs. 2,499 — Free shipping</p>
      <button style="padding:10px 16px;background:#111;color:#fff;border:0;border-radius:8px">Add to cart</button>
      <div class="badge">AdShield script NOT installed yet</div>
    </div>
  </div>
  <div class="hint">
    <b>Yahan paste hoga:</b> HTML ke &lt;head&gt; ke andar, &lt;/head&gt; se pehle AdShield script.
  </div>
</main>
</body></html>`;

const afterHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<title>My Online Store (WITH script)</title>
<style>
  body{font-family:Segoe UI,sans-serif;margin:0;background:#f6f3ee;color:#1a1a1a}
  header{background:#111;color:#fff;padding:16px 24px;display:flex;justify-content:space-between;align-items:center}
  main{max-width:900px;margin:40px auto;padding:0 20px}
  .product{background:#fff;border:1px solid #ddd;border-radius:12px;padding:24px;display:grid;grid-template-columns:180px 1fr;gap:20px}
  .img{background:#e8e0d5;height:180px;border-radius:8px}
  .badge{display:inline-block;background:#c8f7d4;color:#0b6b2f;padding:4px 10px;border-radius:999px;font-size:12px;margin-top:12px}
  .hint{margin-top:28px;padding:14px;border:2px solid #2dd4bf;border-radius:10px;color:#0b3b35;background:#e8fffa}
  pre{background:#0b1220;color:#e8eefc;padding:12px;border-radius:8px;overflow:auto;font-size:12px;margin-top:8px}
</style>
${snippet}
</head>
<body>
<header><strong>My Online Store</strong><span>Cart (0)</span></header>
<main>
  <div class="product">
    <div class="img"></div>
    <div>
      <h1>Vitamin C Serum</h1>
      <p>Rs. 2,499 — Free shipping</p>
      <button style="padding:10px 16px;background:#111;color:#fff;border:0;border-radius:8px">Add to cart</button>
      <div class="badge">AdShield script INSTALLED in &lt;head&gt;</div>
    </div>
  </div>
  <div class="hint">
    <b>Script pasted here (in head):</b>
    <pre>${snippet.replace(/</g, "&lt;")}</pre>
    Visitor isiliye dashboard pe dikhega.
  </div>
</main>
</body></html>`;

fs.writeFileSync(path.join(DEMO_DIR, "before.html"), beforeHtml);
fs.writeFileSync(path.join(DEMO_DIR, "index.html"), afterHtml);

// Tiny static server for demo store
const server = http.createServer((req, res) => {
  const file = req.url === "/before.html" ? "before.html" : "index.html";
  const full = path.join(DEMO_DIR, file);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(full));
});
await new Promise((r) => server.listen(STORE_PORT, "127.0.0.1", r));
console.log("demo store on", STORE_PORT);

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shot(name) {
  const file = `${OUT}\\${name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", name);
}

// A) Login + dashboard BEFORE traffic (zeros)
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard", { timeout: 15000 });
await page.waitForTimeout(1200);
await shot("01-dashboard-zero");

// B) Open Link your website + highlight snippet
const linkBtn = page.locator("button").filter({ hasText: /Link your website|not connected|Installed/i }).first();
if (await linkBtn.count()) {
  await linkBtn.click().catch(() => {});
}
await page.waitForTimeout(500);
await shot("02-copy-script-panel");

// Click Copy if available
const copyBtn = page.getByRole("button", { name: /^Copy$/i });
if (await copyBtn.count()) {
  await copyBtn.click().catch(() => {});
  await page.waitForTimeout(400);
  await shot("03-script-copied");
}

// C) Other website BEFORE paste
await page.goto(`http://127.0.0.1:${STORE_PORT}/before.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await shot("04-other-website-before");

// D) Other website AFTER paste (script in head)
await page.goto(`http://127.0.0.1:${STORE_PORT}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2000); // let tracker fire pageview
await shot("05-other-website-with-script");

// Visit again as "another visitor" style by reloading + extra pageviews via collect for clarity
for (let i = 0; i < 2; i++) {
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
}

// Also seed one bot hit so radar/stats interesting
await api("/api/collect", {
  method: "POST",
  body: {
    site_id: siteId,
    type: "honeypot_hit",
    url: "http://127.0.0.1:5500/",
    referrer: "https://google.com/ads",
    user_agent: "python-requests/2.31.0",
    device_id: "bot-demo-1",
    client_time: new Date().toISOString(),
  },
});

// E) Back to dashboard — numbers changed
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await shot("06-dashboard-after-traffic");

await page.evaluate(() => window.scrollBy(0, 420));
await page.waitForTimeout(600);
await shot("07-feed-shows-visits");

await browser.close();
server.close();
fs.writeFileSync(`${OUT}\\meta.json`, JSON.stringify({ email, password, siteId, snippet }, null, 2));
console.log("DONE");
