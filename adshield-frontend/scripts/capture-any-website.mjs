import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const jwt = require("c:/work/Haseeb/Mahad/adshield-backend-nodejs (1)/adshield-backend-node/node_modules/jsonwebtoken");

const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\any-website-shots";
fs.mkdirSync(OUT, { recursive: true });

const token = jwt.sign({ sub: "haseeb@gmail.com" }, "dev-jwt-secret-adshield-local", { expiresIn: "7d" });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shot(n) {
  await page.screenshot({ path: path.join(OUT, `${n}.png`), fullPage: false });
  console.log("saved", n);
}

await page.goto("file:///c:/work/Haseeb/Mahad/AdShield-Intro-Video/explain-google/04-where-script.html");
await page.waitForTimeout(400);
await shot("01-where-script");

await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle" });
await page.evaluate(
  ([s]) => localStorage.setItem("adshield_session", JSON.stringify(s)),
  [{ accessToken: token, email: "haseeb@gmail.com", storeName: "Haseeb Uddin", platform: "Other", siteId: "8a0c8c9854024d36" }]
);
await page.goto("http://127.0.0.1:5173/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const linkBtn = page.locator("button").filter({ hasText: /Link your website|connected|Installed/i }).first();
if (await linkBtn.count()) await linkBtn.click().catch(() => {});
await page.waitForTimeout(500);
await shot("02-dashboard-script");

await page.goto("http://127.0.0.1:5500/real-store.html", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await shot("03-example-store-any-website");

await page.goto("http://127.0.0.1:5173/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await shot("04-dashboard-after");

await page.evaluate(() => window.scrollBy(0, 480));
await page.waitForTimeout(500);
await shot("05-feed");

await browser.close();
console.log("DONE");
