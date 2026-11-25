// Screenshoty pri rôznych šírkach + kontrola horizontálneho pretečenia. bun qa/widths.ts <url> <šírky...>
import { chromium } from "playwright";
import { mkdirSync } from "fs";
const [url, ...ws] = process.argv.slice(2);
mkdirSync(import.meta.dir + "/widths", { recursive: true });
const b = await chromium.launch({ args: ["--hide-scrollbars"] });
for (const w of ws.map(Number)) {
  const p = await b.newPage({ viewport: { width: w, height: w < 768 ? 844 : w < 1024 ? 1180 : Math.round(w * 0.65) }, reducedMotion: "reduce" });
  await p.goto(url, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready);
  const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight, fs: getComputedStyle(document.documentElement).fontSize }));
  await p.evaluate(() => document.querySelectorAll("img[loading=lazy]").forEach(i => i.setAttribute("loading", "eager")));
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${import.meta.dir}/widths/${w}.png`, fullPage: true });
  console.log(w, JSON.stringify(info), info.sw > info.cw ? "PRETEKÁ" : "ok");
  await p.close();
}
await b.close();
