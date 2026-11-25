# Areaprint web: prototyp homepage v02

Vite + TypeScript + čisté CSS (bez UI frameworku). Stránka sa skladá z komponentov pri builde (prerender vo `vite.config.ts`), výstup v `dist/` je statické HTML, ktoré sa dá nasadiť kamkoľvek.

## Spustenie (na tomto Macu je Bun, Node nie je)

```bash
bun install
bun run dev          # dev server (v02 beží v našom nastavení na porte 5180: bunx --bun vite --port 5180)
bun run dev:https    # HTTPS na porte 5443 pre test na telefóne (naklonenie funguje len cez HTTPS)
bunx --bun vite build   # statický build do dist/
bunx --bun vite preview # náhľad buildu, http://localhost:4173
```

## Čo je nové oproti v01

- Figma: sekcia v02 `58:4975`, desktop `97:3346`, mobil `113:1195`.
- Hero na celú šírku so svetlým rastrom (sleduje kurzor, na mobile naklonenie), fotky v nadpise, pás log.
- Riešenia ako index s náhľadom: riadok pod kurzorom je aktívny a mení fotku; na mobile slider kariet.
- Proces ako schody (pri objavení vyrastú zdola).
- Realizácie: slider s kapitolami, automatické prepínanie s ukazovateľom priebehu, pri hoveri stojí.
- Technológie: tmavá dlaždica s rastrom a mriežkou kariet, hover pastelový so šípkou v kruhu.
- Magazín: tri karty s fotkou.
- Prevzatý feedback z v01: hover tlačidiel (inverzia + text odíde hore), šípky v kruhoch, päta na mobile na celú šírku, raster bez kurzora.
- Štýly: `src/styles/core.css` (spoločné komponenty) a `src/styles/v02.css` (sekcie v02). Interakcie v `src/lib/v2.ts`.

## Štruktúra

- `src/styles/tokens.css`: tokeny v rem (1rem = 16px pri 1280), typografia Desktop/Mobile, radius, pohyb.
- `src/styles/base.css`: písmo, škálovanie desktopu (`clamp(12.8px, šírka × 0.0125, 24px)` = scale 0.8 až 1.5), typografické triedy, reveal.
- `src/styles/components.css`: všetky komponenty, mobil (< 1024) a tablet (768–1023, návrh).
- `src/components/core.ts`: Button, Nav item, Icon button, Chip, Icon pill, Tech link, Slider dots, Client logo, Photo.
- `src/components/blocks.ts`: Navigation (+ mobilné menu, návrh), Section header, Solution tile, Step tile, Realization card, CTA banner, Article tile, Footer.
- `src/page.ts`: obsah homepage (texty z Figmy).
- `src/lib/raster.ts`: shader Raster Diamant v GLSL ES 3.0 (port 1:1 z WGSL), kurzor, gyroskop, voľný pohyb.
- `src/lib/marquee.ts`: pásy pilulkiek (scroll) a log (ticker).
- `src/lib/ui.ts`: slidery, reveal, menu, scrollspy, newsletter, škála.

## Skripty

- `bun scripts/icons.ts`: ikony z Figma exportov → `src/icons.ts`.
- `bun scripts/images.ts`: fotky → WebP 480/800/1200/1600.
- `bun scripts/font.ts`: DM Sans podmnožina z plného fontu (opsz 14, SS01–SS05 zachované).
- `bun scripts/raster-fallback.ts`: statické PNG rastra (fallback bez WebGL2 a placeholder pred načítaním).

## Kontrola

- `bun qa/compare.ts http://localhost:5173/ desktop|mobile`: screenshot webu vs Figma, dvojice v `qa/desktop-1280/` a `qa/mobile-390/` (Figma | web | diff).
- `bun qa/widths.ts http://localhost:5173/ 1024 1440 1920 360 430 820`: ďalšie šírky v `qa/widths/`.
- `bun qa/tilt.ts https://localhost:5443/`: simulácia naklonenia telefónu, vypíše polohu stredu rastra.
- `bun qa/hover.ts`: screenshoty hover stavov v `qa/hover/`.
- Lighthouse (mobil) v `qa/lighthouse/mobile.report.html`.
