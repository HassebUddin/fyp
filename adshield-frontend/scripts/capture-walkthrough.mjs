/**
 * Capture real AdShield UI pages for the walkthrough video.
 * Run: npx playwright install chromium && node scripts/capture-walkthrough.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = "c:\\work\\Haseeb\\Mahad\\AdShield-Intro-Video\\real-shots";
const BASE = "http://127.0.0.1:5173";
const stamp = Date.now();
const email = `demo${stamp}@adshield.local`;
const password = "Demo1234!";

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function shot(name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("saved", file);
}

// 1) Signup
await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await shot("01-signup");

await page.fill('input[type="text"]', "Demo Store");
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await shot("02-signup-filled");

await page.click('button[type="submit"]');
await page.waitForURL("**/verify-otp", { timeout: 15000 });
await page.waitForTimeout(800);
await shot("03-verify-otp");

// Auto-fill if button exists
const fillBtn = page.getByRole("button", { name: /Auto-fill/i });
if (await fillBtn.count()) {
  await fillBtn.click();
  await page.waitForTimeout(400);
  await shot("04-otp-filled");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
} else {
  // Fallback: read OTP from page text
  const otpText = await page.locator(".font-mono.text-2xl").first().textContent();
  const otp = (otpText || "").replace(/\D/g, "").slice(0, 6);
  for (let i = 0; i < otp.length; i++) {
    await page.locator(".otp-input").nth(i).fill(otp[i]);
  }
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

await page.waitForTimeout(1500);
await shot("05-dashboard");

// Scroll for more dashboard
await page.evaluate(() => window.scrollBy(0, 420));
await page.waitForTimeout(600);
await shot("06-dashboard-lower");

// Login page
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await shot("07-login");

await browser.close();
console.log("DONE", OUT);
console.log("EMAIL", email);
console.log("PASSWORD", password);
