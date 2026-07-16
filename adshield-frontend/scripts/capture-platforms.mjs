import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const jwt = require("c:/work/Haseeb/Mahad/adshield-backend-nodejs (1)/adshield-backend-node/node_modules/jsonwebtoken");
const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\platform-shots";
const DEMO = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\platform-demos";
fs.mkdirSync(OUT, { recursive: true });

const token = jwt.sign({ sub: "haseeb@gmail.com" }, "dev-jwt-secret-adshield-local", { expiresIn: "7d" });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shot = async (n) => {
  await page.screenshot({ path: path.join(OUT, `${n}.png`) });
  console.log("saved", n);
};
const file = (name) => "file:///" + path.join(DEMO, name).replace(/\\/g, "/");

await page.goto(file("shopify-theme.html"));
await page.waitForTimeout(500);
await shot("01-shopify-theme-paste");

await page.goto(file("wordpress-header.html"));
await page.waitForTimeout(500);
await shot("02-wordpress-woocommerce-paste");

await page.goto(file("html-site.html"));
await page.waitForTimeout(400);
await shot("03-any-html-paste");

// After install → open storefront example
await page.goto("http://127.0.0.1:5500/real-store.html", { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await shot("04-storefront-after-install");

await page.goto("http://127.0.0.1:5173/login", { waitUntil: "networkidle" });
await page.evaluate(
  ([s]) => localStorage.setItem("adshield_session", JSON.stringify(s)),
  [{ accessToken: token, email: "haseeb@gmail.com", storeName: "Haseeb Uddin", platform: "Other", siteId: "8a0c8c9854024d36" }]
);
await page.goto("http://127.0.0.1:5173/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("05-dashboard-result");

await browser.close();
console.log("DONE");
