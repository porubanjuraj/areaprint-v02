// Test: menu sa pri scrolle nahor zobrazí pripnuté hore, pri scrolle nadol sa skryje. bun qa/smartnav.ts
import { chromium } from "playwright";
const b = await chromium.launch();
const sites = (process.argv[2] || "v01=http://localhost:5173/,v02=http://localhost:5180/").split(",").map(s => s.split("="));
for (const [name, url] of sites) for (const w of [1280, 390]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
  const st = () => p.evaluate(() => {
    const n = document.querySelector(".site-header .navigation") as HTMLElement; const r = n.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + 40, r.top + r.height / 2);
    return `top=${Math.round(r.top)} trieda="${n.className.replace("navigation", "").trim()}" navrchu=${n.contains(hit)}`;
  });
  const wheel = async (dy: number, n = 1) => { for (let i = 0; i < n; i++) { await p.mouse.wheel(0, dy); await p.waitForTimeout(120); } await p.waitForTimeout(600); };
  await p.mouse.move(w / 2, 400);
  const s0 = await st();
  await wheel(400, 6); const down = await st();
  await wheel(-150, 2); const up = await st();
  await wheel(300, 2); const down2 = await st();
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400); const top = await st();
  console.log(`${name} ${w}px | začiatok: ${s0}\n   nadol: ${down}\n   nahor: ${up}\n   znova nadol: ${down2}\n   úplne hore: ${top}`);
  if (w === 1280) { await wheel(400, 6); await wheel(-150, 2); await p.screenshot({ path: `/tmp/smartnav-${name}.png` }); }
  await p.close();
}
await b.close();
