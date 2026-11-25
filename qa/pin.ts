// Kontrola pripnutia sekcie Technológie: počas scrollu stojí, pilulky idú od prvej po poslednú. bun qa/pin.ts <url>
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 832 } });
await p.goto(process.argv[2] || "http://localhost:5173/", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
const info = await p.evaluate(() => { const pin = document.querySelector<HTMLElement>("[data-pin]")!; return { pinTop: pin.getBoundingClientRect().top + scrollY, pinH: pin.offsetHeight, secH: document.querySelector<HTMLElement>(".tech")!.offsetHeight }; });
console.log(info);
for (const f of [-0.1, 0, 0.25, 0.5, 0.75, 1, 1.1]) {
  const y = info.pinTop - (832 - info.secH) / 2 + f * (info.pinH - info.secH);
  await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(900);
  console.log(`postup ${f.toFixed(2)}`, await p.evaluate(() => {
    const s = document.querySelector(".tech")!.getBoundingClientRect(); const l = [...document.querySelectorAll(".tech__links .tech-link")].map(e => e.getBoundingClientRect());
    return `sekcia.top=${Math.round(s.top)} prvá.left=${Math.round(l[0].left)} posledná.right=${Math.round(l.at(-1)!.right)}`;
  }));
}
await b.close();
