/**
 * Základné komponenty v01 (Figma frame „v01 · Komponenty“).
 * Každý komponent je čistá funkcia, ktorá vracia HTML reťazec. Stránka sa
 * z nich poskladá pri builde (prerender vo vite.config.ts), takže výsledok je statické HTML.
 */
import { icons, type IconName } from "../icons";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const icon = (name: IconName, cls = "") => icons[name].replace("<svg ", `<svg class="${cx("icon", cls)}" `);

/* ---------- Button (76:334) ---------- */
export type ButtonStyle = "accent" | "outline" | "outline-dark";
export type ButtonSize = "s" | "m" | "l";
export function Button(p: { label: string; href: string; style?: ButtonStyle; size?: ButtonSize; full?: boolean; cls?: string; attrs?: string }) {
  const { style = "accent", size = "m" } = p;
  const text = size === "l" ? "t-link-m" : size === "s" ? "t-button-s" : "t-button-m";
  // hover: text odíde hore a rovnaký text príde zdola (druhá kópia je pre čítačky skrytá)
  return `<a class="${cx("btn", `btn--${style}`, `btn--${size}`, p.full && "btn--full", p.cls)}" href="${p.href}"${p.attrs ? " " + p.attrs : ""}><span class="btn__label ${text}"><span class="btn__roll"><span>${p.label}</span><span aria-hidden="true">${p.label}</span></span></span></a>`;
}

/* ---------- Nav item (76:341) ---------- */
export function NavItem(p: { label: string; href: string; active?: boolean }) {
  return `<a class="${cx("nav-item", "t-label-s", p.active && "is-active")}" href="${p.href}" data-spy="${p.href}">${p.label}</a>`;
}

/* ---------- Icon button (76:344), šípka ↗ 56 px ---------- */
export function IconButton(p: { cls?: string } = {}) {
  return `<span class="${cx("icon-btn", p.cls)}" aria-hidden="true"><span class="icon-btn__arrow">↗</span></span>`;
}

/* ---------- Chip (76:351): Pastel / Light ---------- */
export function Chip(p: { label: string; tone?: "pastel" | "light" | "subtle"; attrs?: string; cls?: string }) {
  return `<span class="${cx("chip", "t-body-s", `chip--${p.tone ?? "light"}`, p.cls)}"${p.attrs ? " " + p.attrs : ""}>${p.label}</span>`;
}

/* ---------- Icon pill (76:358): Light / Dark ---------- */
// size: 32 = ikona 32 px (CTA, 72 px kruh), 24 = ikona 24 px v 56 px kruhu (v02 Riešenia)
export function IconPill(p: { icon: IconName; theme?: "light" | "dark" | "tint"; size?: 24 | 32; cls?: string }) {
  return `<span class="${cx("icon-pill", `icon-pill--${p.theme ?? "light"}`, `icon-pill--${p.size ?? 32}`, p.cls)}" aria-hidden="true">${icon(p.icon, `icon--${p.size ?? 32}`)}</span>`;
}


/* ---------- Slider dots (81:938) ---------- */
// Bodky sú len indikátor (v dizajne 8–10 px, na dotyk by boli príliš malé); slider sa ovláda swipom a klávesnicou.
export function SliderDots(p: { count: number; target: string; label: string }) {
  const dots = Array.from({ length: p.count }, (_, i) => `<span class="${cx("dots__dot", i === 0 && "is-active")}"></span>`).join("");
  return `<div class="dots" data-dots-for="${p.target}" aria-hidden="true">${dots}</div>`;
}

/* ---------- Client logo (77:503) ---------- */
export function ClientLogo(p: { file: string; name: string; hidden?: boolean }) {
  return `<span class="client-logo"><img src="/img/${p.file}-192.webp" srcset="/img/${p.file}-192.webp 192w, /img/${p.file}-288.webp 288w" sizes="8rem" width="128" height="64" alt="${p.hidden ? "" : p.name}" loading="lazy" decoding="async"></span>`;
}

/* ---------- Fotka: WebP so srcset ---------- */
export function Photo(p: { name: string; alt: string; sizes: string; cls?: string; eager?: boolean; reveal?: boolean; delay?: number }) {
  const widths = [480, 800, 1200, 1600];
  const srcset = widths.map(w => `/img/${p.name}-${w}.webp ${w}w`).join(", ");
  const attrs = p.reveal === false ? "" : ` data-reveal="img"${p.delay ? ` style="--reveal-delay:${p.delay}ms"` : ""}`;
  return `<span class="${cx("photo", p.cls)}"${attrs}><img src="/img/${p.name}-800.webp" srcset="${srcset}" sizes="${p.sizes}" alt="${p.alt}" ${p.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></span>`;
}
