/** Interakcie sekcií v02: index Riešení s náhľadom, slider Realizácií s kapitolami. */

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => matchMedia("(max-width: 1023.98px)").matches;

/** index aktívnej karty v horizontálnom slideri podľa scrollu */
function sliderIndex(slider: HTMLElement, items: HTMLElement[]) {
  const max = slider.scrollWidth - slider.clientWidth;
  if (max > 0 && slider.scrollLeft >= max - 2) return items.length - 1;
  const step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : slider.clientWidth;
  return Math.max(0, Math.min(items.length - 1, Math.round(slider.scrollLeft / step)));
}

/* ---------- Riešenia: riadok pod kurzorom (desktop) alebo zobrazená karta (mobil) je aktívna a mení fotku ---------- */
export function initSolutionsIndex() {
  const root = document.querySelector<HTMLElement>("[data-sol-index]");
  if (!root) return;
  const rows = [...root.querySelectorAll<HTMLElement>(".sol-row")];
  const photos = [...root.querySelectorAll<HTMLElement>(".sol-index__photo")];
  const list = root.querySelector<HTMLElement>(".sol-index__list")!;
  let current = 0;
  const set = (i: number) => {
    if (i === current) return;
    current = i;
    rows.forEach((r, k) => r.classList.toggle("is-active", k === i));
    photos.forEach((p, k) => p.classList.toggle("is-active", k === i));
  };
  rows.forEach((r, i) => {
    r.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" && !isMobile()) set(i); });
    r.addEventListener("focusin", () => set(i));
  });
  let raf = 0;
  list.addEventListener("scroll", () => {
    if (!isMobile() || raf) return;
    raf = requestAnimationFrame(() => { raf = 0; set(sliderIndex(list, rows)); });
  }, { passive: true });
}

/* ---------- Realizácie: slider s kapitolami, automatické prepínanie s ukazovateľom priebehu ---------- */
export function initRealizations() {
  const root = document.querySelector<HTMLElement>("[data-rs]");
  if (!root) return;
  const slides = [...root.querySelectorAll<HTMLElement>(".rs-slide")];
  const chapters = [...root.querySelectorAll<HTMLButtonElement>(".rs-chapter")];
  const list = root.querySelector<HTMLElement>(".rs__chapters")!;
  const items = [...list.querySelectorAll<HTMLElement>(":scope > .slider__item")];
  let current = 0;
  let fromScroll = false;

  const set = (i: number, opts: { scroll?: boolean } = {}) => {
    i = (i + slides.length) % slides.length;
    current = i;
    slides.forEach((s, k) => {
      const on = k === i;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", String(!on));
      s.querySelectorAll("a").forEach(a => on ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1"));
    });
    chapters.forEach((c, k) => {
      c.classList.toggle("is-active", k === i);
      c.setAttribute("aria-current", String(k === i));
      // reštart animácie priebehu
      const bar = c.querySelector<HTMLElement>(".rs-chapter__bar span");
      if (bar && k === i) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
    });
    if (opts.scroll && isMobile()) {
      fromScroll = true;
      list.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: reduce() ? "auto" : "smooth" });
      setTimeout(() => (fromScroll = false), 700);
    }
  };

  chapters.forEach((c, i) => c.addEventListener("click", () => set(i, { scroll: true })));
  let raf = 0;
  list.addEventListener("scroll", () => {
    if (!isMobile() || fromScroll || raf) return;
    raf = requestAnimationFrame(() => { raf = 0; const i = sliderIndex(list, items); if (i !== current) set(i); });
  }, { passive: true });

  // automatické prepínanie: koniec animácie priebehu v aktívnej kapitole = ďalšia realizácia
  if (reduce()) return;
  root.dataset.autoplay = "";
  chapters.forEach(c => c.querySelector(".rs-chapter__bar span")?.addEventListener("animationend", () => {
    if (c.classList.contains("is-active")) set(current + 1, { scroll: true });
  }));
  const pause = (on: boolean) => on ? (root.dataset.paused = "") : delete root.dataset.paused;
  root.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") pause(true); });
  root.addEventListener("pointerleave", () => pause(false));
  root.addEventListener("focusin", () => pause(true));
  root.addEventListener("focusout", () => pause(false));
  list.addEventListener("touchstart", () => pause(true), { passive: true });
  list.addEventListener("touchend", () => setTimeout(() => pause(false), 2500), { passive: true });
  // mimo obrazovky stojí
  new IntersectionObserver(([e]) => { if (e.isIntersecting) delete root.dataset.offscreen; else root.dataset.offscreen = ""; pause(!e.isIntersecting); }, { threshold: 0.2 }).observe(root);
}
