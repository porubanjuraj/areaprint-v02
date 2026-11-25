// Screenshoty hover stavov (stred animácie a koniec). bun qa/hover.ts <url>
import { chromium } from "playwright";
import { mkdirSync } from "fs";
const url = process.argv[2] || "http://localhost:5173/";
const out = import.meta.dir + "/hover"; mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 832 }, deviceScaleFactor: 2 });
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
const cases: [string, string][] = [
  ["hero-accent", ".hero-tile .btn--accent"], ["hero-outline-dark", ".hero-tile .btn--outline-dark"],
  ["nav-cta", ".navigation__cta"], ["header-outline", "#realizacie .section-header__link"],
  ["solution-tile", ".solution-tile--large:nth-child(2)"], ["tech-link", ".tech__links li:nth-child(2) .tech-link"],
];
for (const [name, sel] of cases) {
  const el = p.locator(sel).first();
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
  const target = name === "solution-tile" ? el : name === "tech-link" ? el : el.locator("xpath=..");
  await el.hover(); await p.waitForTimeout(130);
  await target.screenshot({ path: `${out}/${name}-mid.png` });
  await p.waitForTimeout(800);
  await target.screenshot({ path: `${out}/${name}-end.png` });
  await p.mouse.move(0, 0); await p.waitForTimeout(500);
}
await b.close(); console.log("ok");
