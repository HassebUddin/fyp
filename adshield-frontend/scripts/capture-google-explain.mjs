/**
 * Google-analogy explainer + real AdShield login/dashboard test video shots
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const backendJwt = require("c:/work/Haseeb/Mahad/adshield-backend-nodejs (1)/adshield-backend-node/node_modules/jsonwebtoken");

const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\google-explain-shots";
const EXPLAIN = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\explain-google";
const BASE = "http://127.0.0.1:5173";
const STORE = "http://127.0.0.1:5500/";

fs.mkdirSync(OUT, { recursive: true });

const token = backendJwt.sign({ sub: "haseeb@gmail.com" }, "dev-jwt-secret-adshield-local", {
  expiresIn: "7d",
});

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shot(name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", name);
}

// 1-3: Google analogy explain pages (file:// works fine for static HTML)
await page.goto("file:///" + EXPLAIN.replace(/\\/g, "/") + "/01-analogy.html", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await shot("01-google-vs-adshield");

await page.goto("file:///" + EXPLAIN.replace(/\\/g, "/") + "/02-steps.html", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await shot("02-test-steps");

await page.goto("file:///" + EXPLAIN.replace(/\\/g, "/") + "/03-counts.html", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await shot("03-counts-meaning");

// 4: Real login page
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await shot("04-login-page");

// Fill login visually (won't submit wrong password) then inject session
await page.fill('input[type="email"]', "haseeb@gmail.com");
await page.fill('input[type="password"]', "********");
await shot("05-login-filled");

await page.evaluate(
  ([session]) => localStorage.setItem("adshield_session", JSON.stringify(session)),
  [{ accessToken: token, email: "haseeb@gmail.com", storeName: "Haseeb Uddin", platform: "Other", siteId: "8a0c8c9854024d36" }]
);

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("06-dashboard");

const linkBtn = page.locator("button").filter({ hasText: /Link your website|connected|Installed/i }).first();
if (await linkBtn.count()) await linkBtn.click().catch(() => {});
await page.waitForTimeout(500);
await shot("07-copy-script");

await page.goto(STORE, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await shot("08-website-visit");

await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await shot("09-dashboard-updated");

await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(600);
await shot("10-live-feed");

await browser.close();
console.log("DONE");
