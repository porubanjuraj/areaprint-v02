// Porovnanie hero s Figmou (súbory /tmp/hero26/f-*.png zo get_screenshot). bun qa/hero-compare.ts
import { chromium } from "playwright";
import sharp from "sharp";
const b = await chromium.launch({ args: ["--hide-scrollbars", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const shots: [string, string, number, { x: number; y: number; width: number; height: number }][] = [
  ["v01-d", "http://localhost:5173/", 1280, { x: 24, y: 24, width: 1232, height: 552 }],
  ["v01-m", "http://localhost:5173/", 390, { x: 0, y: 0, width: 390, height: 858 }],
  ["v02-d", "http://localhost:5180/", 1280, { x: 0, y: 0, width: 1280, height: 832 }],
  ["v02-m", "http://localhost:5180/", 390, { x: 0, y: 0, width: 390, height: 698 }],
];
for (const [name, url, w, clip] of shots) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await p.goto(url, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  await p.screenshot({ path: `/tmp/hero26/w-${name}.png`, clip });
  const f = await sharp(`/tmp/hero26/f-${name}.png`).removeAlpha().raw().toBuffer();
  const wv = await sharp(`/tmp/hero26/w-${name}.png`).removeAlpha().raw().toBuffer();
  let bad = 0; for (let i = 0; i < f.length; i += 3) if (Math.max(Math.abs(f[i] - wv[i]), Math.abs(f[i + 1] - wv[i + 1]), Math.abs(f[i + 2] - wv[i + 2])) > 40) bad++;
  const scale = w === 390 ? 1 : 0.55;
  const fa = await sharp(`/tmp/hero26/f-${name}.png`).resize({ width: Math.round(clip.width * scale) }).toBuffer();
  const wa = await sharp(`/tmp/hero26/w-${name}.png`).resize({ width: Math.round(clip.width * scale) }).toBuffer();
  const m = await sharp(fa).metadata();
  await sharp({ create: { width: m.width! * 2 + 10, height: m.height!, channels: 3, background: "#ff00ff" } })
    .composite([{ input: fa, left: 0, top: 0 }, { input: wa, left: m.width! + 10, top: 0 }]).png().toFile(`/tmp/hero26/cmp-${name}.png`);
  console.log(name, `rozdielnych pixelov ${(bad / (f.length / 3) * 100).toFixed(2)} %`);
  await p.close();
}
await b.close();
