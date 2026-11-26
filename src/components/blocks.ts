/**
 * Zložené komponenty v02 (Figma sekcia 58:4975): Navigation (tmavá), Section header, Solutions index,
 * Process stairs, CTA banner, Realizations slider s kapitolami, Tech tiles, Magazine cards, Footer.
 */
import { Button, Chip, IconButton, IconPill, NavItem, Photo, SliderDots, cx, icon } from "./core";
import type { IconName } from "../icons";

export const NAV = [
  { label: "Riešenia", href: "#riesenia" },
  { label: "Realizácie", href: "#realizacie" },
  { label: "O nás", href: "#proces" },
  { label: "Magazín", href: "#magazin" },
  { label: "Kontakt", href: "#kontakt" },
];

/* ---------- Navigation v02 (97:3262): tmavá pilulka v hero ---------- */
export function Navigation() {
  return `<nav class="navigation on-dark" aria-label="Hlavná navigácia">
  <a class="navigation__logo" href="#top" aria-label="Areaprint, na začiatok stránky">${icon("logo")}</a>
  <div class="navigation__items">${NAV.map(n => NavItem(n)).join("")}</div>
  <div class="navigation__end">
    ${Button({ label: "Tlač na mieru", href: "#kontakt", style: "accent", size: "s", cls: "navigation__cta" })}
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Otvoriť menu"><span></span><span></span></button>
  </div>
</nav>`;
}

/* Mobilné menu: v dizajne nie je, NÁVRH (overlay v štýle navigácie) */
export function MobileMenu() {
  return `<div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="mobile-menu__bar on-dark">
    <a class="navigation__logo" href="#top" aria-label="Areaprint, na začiatok stránky">${icon("logo")}</a>
    <button class="menu-btn is-open" type="button" aria-label="Zavrieť menu" data-menu-close><span></span><span></span></button>
  </div>
  <ul class="mobile-menu__list">
    ${NAV.map(n => `<li><a class="mobile-menu__link t-heading-xl" href="${n.href}">${n.label}</a></li>`).join("")}
  </ul>
  ${Button({ label: "Tlač na mieru", href: "#kontakt", style: "accent", size: "m", full: true })}
</div>`;
}

/* ---------- Section header v02: nadpis + odkaz (na mobile odkaz pod obsahom) ---------- */
export function SectionHead(p: { id: string; title: string; link?: { label: string; href: string }; align?: "center" | "end"; titleCls?: string }) {
  return `<div class="${cx("sec-head", p.align === "end" && "sec-head--end")}" data-reveal>
  <h2 class="${cx("sec-head__title t-display-l", p.titleCls)}" id="${p.id}-title">${p.title}</h2>
  ${p.link ? Button({ label: p.link.label, href: p.link.href, style: "outline", size: "l", cls: "sec-head__link" }) : ""}
</div>`;
}
/* odkaz sekcie na mobile (pod obsahom, cez celú šírku) */
export const MobileLink = (l: { label: string; href: string }) => Button({ label: l.label, href: l.href, style: "outline", size: "l", full: true, cls: "m-only" });

/* ---------- Riešenia A · Index s náhľadom (104:3547) ---------- */
export type Solution = { icon: IconName; title: string; text: string; photo: string; alt: string; href: string };
export function SolutionsIndex(items: Solution[]) {
  const photos = items.map((s, i) => Photo({
    name: s.photo, alt: s.alt, sizes: "(min-width: 1024px) 38vw, 90vw",
    cls: cx("sol-index__photo", i === 0 && "is-active"), reveal: false,
  }).replace('class="photo', `data-index="${i}" class="photo`)).join("");
  const rows = items.map((s, i) => `<li class="${cx("sol-row", "slider__item", i === 0 && "is-active")}" data-index="${i}">
      ${IconPill({ icon: s.icon, theme: "tint", size: 24, cls: "sol-row__pill" })}
      <div class="sol-row__text">
        <h3 class="sol-row__title t-heading-m"><a class="stretched" href="${s.href}">${s.title}</a></h3>
        <p class="sol-row__desc t-body-s">${s.text}</p>
      </div>
      ${IconButton({ cls: "sol-row__btn" })}
    </li>`).join("");
  return `<div class="sol-index" data-sol-index>
  <div class="sol-index__media" data-reveal="img">${photos}</div>
  <ul class="sol-index__list slider" id="sol-slider" tabindex="0" aria-label="Riešenia">${rows}</ul>
  ${SliderDots({ count: items.length, target: "sol-slider", label: "Riešenia" })}
</div>`;
}

/* ---------- Proces B · Schody (104:3634) ---------- */
export function ProcessStairs(steps: { num: string; label: string; highlight?: boolean }[]) {
  return `<ol class="stairs">${steps.map((s, i) => `<li class="${cx("stair", s.highlight && "stair--highlight")}" style="--i:${i}" data-reveal>
    <span class="stair__num" aria-hidden="true">${s.num}</span>
    <p class="stair__label"><span class="visually-hidden">Krok ${Number(s.num)}: </span>${s.label}</p>
  </li>`).join("")}</ol>`;
}

/* ---------- CTA banner (81:886) ---------- */
export function CtaBanner() {
  return `<aside class="cta-banner on-dark" data-reveal aria-label="Výroba na mieru">
  ${IconPill({ icon: "merge", theme: "dark" })}
  <p class="cta-banner__text t-heading-s">Nemusíte koordinovať jednotlivé kroky výroby.<br class="br-d"> Prepojíme technickú prípravu, výrobu<br class="br-m"> a realizáciu do jedného postupu.</p>
  ${Button({ label: "Tlač na mieru", href: "#kontakt", style: "accent", size: "m", cls: "cta-banner__btn" })}
</aside>`;
}

/* ---------- Realizácie B3 · Kapitoly pod fotkou (104:3754) ---------- */
export type Realization = { chip: string; title: string; text: string; chapter: string; photo: string; alt: string; href: string };
export function RealizationsSlider(items: Realization[]) {
  const slides = items.map((r, i) => `<article class="${cx("rs-slide", i === 0 && "is-active")}" data-index="${i}" aria-hidden="${i === 0 ? "false" : "true"}">
      ${Photo({ name: r.photo, alt: r.alt, sizes: "(min-width: 1024px) 93vw, 90vw", cls: "rs-slide__photo", reveal: false })}
      <div class="rs-slide__panel">
        <div class="rs-slide__top">${Chip({ label: r.chip, tone: "subtle" })}${IconButton({ cls: "rs-slide__btn" })}</div>
        <div class="rs-slide__text">
          <h3 class="t-heading-xl"><a class="stretched" href="${r.href}"${i === 0 ? "" : ' tabindex="-1"'}>${r.title}</a></h3>
          <p class="t-body-m muted">${r.text}</p>
        </div>
      </div>
    </article>`).join("");
  const chapters = items.map((r, i) => `<li class="slider__item">
      <button class="${cx("rs-chapter", i === 0 && "is-active")}" type="button" data-index="${i}" aria-controls="rs-stage" aria-current="${i === 0}">
        <span class="rs-chapter__bar" aria-hidden="true"><span></span></span>
        <span class="rs-chapter__inner">
          ${Photo({ name: r.photo, alt: "", sizes: "8rem", cls: "rs-chapter__thumb", reveal: false })}
          <span class="rs-chapter__text"><span class="t-body-s muted">${r.chip}</span><span class="rs-chapter__title t-heading-xs">${r.chapter}</span></span>
        </span>
      </button>
    </li>`).join("");
  return `<div class="rs" data-rs>
  <div class="rs__stage" id="rs-stage" aria-live="polite" data-reveal="img">${slides}</div>
  <ul class="rs__chapters slider" id="rs-chapters" tabindex="0" aria-label="Vybrať realizáciu" data-reveal>${chapters}</ul>
  ${SliderDots({ count: items.length, target: "rs-chapters", label: "Realizácie" })}
</div>`;
}

/* ---------- Technológie E · Tmavá (104:3682) ---------- */
export function TechTiles(items: { icon: IconName; label: string; href: string }[]) {
  return `<ul class="tech-grid">${items.map((t, i) => `<li data-reveal style="--reveal-delay:${(i % 3) * 70}ms">
    <a class="tech-card" href="${t.href}">
      <span class="tech-card__top">${icon(t.icon, "icon--28")}<span class="tech-card__arrow" aria-hidden="true"><span>↗</span></span></span>
      <span class="tech-card__label">${t.label}</span>
    </a>
  </li>`).join("")}</ul>`;
}

/* ---------- Magazín C · Tri karty (109:3907) ---------- */
export function MagazineCards(items: { chip: string; title: string; meta: string; photo: string; alt: string; href: string }[]) {
  return `<div class="mag slider" id="mag-slider" tabindex="0" aria-label="Články z magazínu">${items.map((a, i) => `<article class="mag-card slider__item" data-reveal style="--reveal-delay:${i * 70}ms">
    <div class="mag-card__media">
      ${Photo({ name: a.photo, alt: a.alt, sizes: "(min-width: 1024px) 31vw, 72vw", cls: "mag-card__photo", reveal: false })}
      ${Chip({ label: a.chip, tone: "light", cls: "mag-card__chip" })}
    </div>
    <div class="mag-card__text">
      <h3 class="t-heading-m"><a class="stretched" href="${a.href}">${a.title}</a></h3>
      <p class="t-body-s muted">${a.meta}</p>
    </div>
  </article>`).join("")}</div>
  ${SliderDots({ count: items.length, target: "mag-slider", label: "Magazín" })}`;
}

/* ---------- Footer (81:937), v02 na celú šírku ---------- */
export function Footer() {
  const col = (title: string, links: [string, string][], cls = "") => `<div class="footer__col ${cls}">
      <h2 class="t-heading-s">${title}</h2>
      <ul class="footer__links t-label-m">${links.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul>
    </div>`;
  return `<footer class="footer on-dark" id="kontakt" data-reveal>
  <div class="footer__news">
    <div class="footer__news-head">
      <p class="t-label-m" id="newsletter-label">Areaprint newsletter</p>
      <h2 class="t-display-l">Dobré témy<br class="br-d"> majú pokračovanie</h2>
    </div>
    <form class="newsletter" novalidate aria-labelledby="newsletter-label">
      <div class="newsletter__row">
        <label class="visually-hidden" for="nl-email">Váš e-mail</label>
        <input class="newsletter__input" id="nl-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="Váš e-mail" required>
        <button class="newsletter__submit" type="submit">Odoberať</button>
      </div>
      <label class="newsletter__consent">
        <input type="checkbox" name="consent" required>
        <span class="newsletter__box" aria-hidden="true"></span>
        <span class="newsletter__consent-text">Chcem dostávať newsletter Areaprint.<br class="br-m"> Z odberu sa budem môcť odhlásiť.</span>
      </label>
      <p class="newsletter__msg" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div class="footer__bottom">
    <div class="footer__symbol">${icon("symbol")}</div>
    <div class="footer__info">
      <div class="footer__cols">
        ${col("Riešenia a výroba", [["Riešenia", "#riesenia"], ["Produkty a služby", "#technologie"], ["Realizácie", "#realizacie"], ["Ako pracujeme", "#proces"]])}
        ${col("Areaprint", [["O nás", "#proces"], ["Kontakt", "#kontakt"], ["Kariéra", "#"], ["Magazín", "#magazin"]], "footer__col--fixed")}
      </div>
      <address class="footer__contact">
        <a href="tel:+421245642601">+421 245 642 601</a>
        <a class="footer__fixed" href="mailto:area@areaprint.com">area@areaprint.com</a>
      </address>
      <div class="footer__legal">
        <a class="footer__logo" href="#top" aria-label="Areaprint, na začiatok stránky">${icon("logo-footer")}</a>
        <p class="footer__fixed t-label-m">© 2026, Areaprint</p>
      </div>
    </div>
  </div>
</footer>`;
}
