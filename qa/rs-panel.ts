// Panel Realizácií: normál a hover, desktop aj mobil. bun qa/rs-panel.ts <url>
import { chromium } from "playwright";
import { mkdirSync } from "fs";
const url = process.argv[2] || "http://localhost:5180/";
const out = import.meta.dir + "/hover"; mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [name, vp] of [["desktop", { width: 1280, height: 832 }], ["mobile", { width: 390, height: 844 }]] as const) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2, hasTouch: name === "mobile" });
  await p.goto(url, { waitUntil: "networkidle" });
  const panel = p.locator(".rs-slide.is-active .rs-slide__panel");
  await panel.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
  await panel.screenshot({ path: `${out}/rs-panel-${name}.png` });
  console.log(name, await panel.evaluate((el) => { const r = el.getBoundingClientRect(); const btn = el.querySelector(".icon-btn")!.getBoundingClientRect(); return { w: r.width, h: r.height, btn: [btn.width, btn.height, Math.round(r.right - btn.right), Math.round(btn.top - r.top)] }; }));
  if (name === "desktop") {
    await panel.hover(); await p.waitForTimeout(700);
    await panel.screenshot({ path: `${out}/rs-panel-${name}-hover.png` });
    console.log("hover bg", await panel.evaluate((el) => getComputedStyle(el).backgroundColor));
  }
  await p.close();
}
await b.close();
