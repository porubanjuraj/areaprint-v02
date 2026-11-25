// Kontrola interakcií v02 (hover, prepínanie, autoplay). bun qa/interactions.ts <url>
import { chromium } from "playwright";
import { mkdirSync } from "fs";
const url = process.argv[2] || "http://localhost:5180/";
const out = import.meta.dir + "/hover"; mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 832 } });
await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
const shot = async (sel: string, name: string) => { const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(700); await el.screenshot({ path: `${out}/${name}.png` }); };

// Riešenia: hover na 3. riadok
await p.locator("#riesenia").scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
await p.locator(".sol-row").nth(2).hover(); await p.waitForTimeout(800);
console.log("riešenia aktívny:", await p.evaluate(() => [...document.querySelectorAll(".sol-row")].findIndex(r => r.classList.contains("is-active"))),
  "fotka:", await p.evaluate(() => [...document.querySelectorAll(".sol-index__photo")].findIndex(r => r.classList.contains("is-active"))));
await shot(".sol-index", "v02-riesenia-hover");

// Technológie: hover na 1. kartu
await p.locator(".tech-card").first().scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
await p.locator(".tech-card").first().hover(); await p.waitForTimeout(700);
await shot(".tech-grid", "v02-tech-hover");

// Magazín
await p.locator(".mag-card").nth(1).scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
await p.locator(".mag-card").nth(1).hover(); await p.waitForTimeout(800);
await shot(".mag", "v02-magazin-hover");

// Realizácie: autoplay a klik na kapitolu
await p.mouse.move(5, 5);
await p.locator(".rs").scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
const act = () => p.evaluate(() => [...document.querySelectorAll(".rs-slide")].findIndex(s => s.classList.contains("is-active")));
console.log("realizácie na začiatku:", await act());
await p.waitForTimeout(6600);
console.log("realizácie po 6,6 s (autoplay):", await act());
await p.locator(".rs-chapter").nth(2).click(); await p.waitForTimeout(900);
console.log("po kliku na 3. kapitolu:", await act());
await shot(".rs", "v02-realizacie");
// tlačidlo v hero
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
await p.locator(".hero__actions .btn--outline").hover(); await p.waitForTimeout(700);
await shot(".hero__actions", "v02-hero-buttons-hover");
await b.close();
