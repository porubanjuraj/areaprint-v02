/** Slidery (bodky), postupné objavenie, mobilné menu, scrollspy navigácie, newsletter, škálovanie. */

/* --- Škála desktopu: šírka bez scrollbaru (CSS: html font-size = clamp(12.8px, vw * 0.0125, 24px)) --- */
export function initScale() {
  const set = () => document.documentElement.style.setProperty("--vw", `${document.documentElement.clientWidth}px`);
  set();
  addEventListener("resize", set);
}

/* --- Slider dots: aktívny slide podľa scrollu --- */
export function initSliders() {
  document.querySelectorAll<HTMLElement>("[data-dots-for]").forEach(dots => {
    const slider = document.getElementById(dots.dataset.dotsFor!);
    if (!slider) return;
    const items = [...slider.querySelectorAll<HTMLElement>(":scope > .slider__item")];
    const dotEls = [...dots.children] as HTMLElement[];
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = slider.scrollWidth - slider.clientWidth;
      let idx = 0;
      if (max > 0 && slider.scrollLeft >= max - 2) idx = items.length - 1; // na konci je aktívny posledný
      else if (items[1]) idx = Math.min(items.length - 1, Math.round(slider.scrollLeft / (items[1].offsetLeft - items[0].offsetLeft)));
      dotEls.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    };
    slider.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    // klávesnica: šípky posúvajú o jednu kartu
    slider.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (slider.scrollWidth <= slider.clientWidth) return;
      e.preventDefault();
      const step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : slider.clientWidth;
      slider.scrollBy({ left: e.key === "ArrowRight" ? step : -step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  });
}

/* --- Postupné objavenie: raz, pri vstupe do viewportu (threshold 0.15). Hero hneď po načítaní. --- */
export function initReveal() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const root = document.documentElement;
  root.classList.add("motion");
  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }, { threshold: 0.15 });
  // v slideroch (horizontálne mimo obrazovky) by sa karty nikdy neukázali: sledujeme ich riadok
  requestAnimationFrame(() => requestAnimationFrame(() => {
    els.forEach(el => {
      if (el.closest(".site-header, .hero")) el.classList.add("is-in");
      else if (el.closest(".slider")) {
        const slider = el.closest<HTMLElement>(".slider")!;
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.15 });
        o.observe(slider);
      } else io.observe(el);
    });
  }));
}

/* --- Mobilné menu (NÁVRH) --- */
export function initMenu() {
  const menu = document.getElementById("mobile-menu");
  const openBtn = document.querySelector<HTMLButtonElement>(".navigation .menu-btn");
  if (!menu || !openBtn) return;
  const focusables = () => [...menu.querySelectorAll<HTMLElement>("a, button")];
  const close = (restore = true) => {
    menu.hidden = true; menu.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (restore) openBtn.focus();
  };
  const open = () => {
    menu.hidden = false; menu.classList.add("is-open");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    focusables()[1]?.focus();
  };
  openBtn.addEventListener("click", open);
  menu.querySelector("[data-menu-close]")?.addEventListener("click", () => close());
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => close(false)));
  menu.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // focus trap
      const f = focusables(); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia("(min-width: 1024px)").addEventListener("change", e => { if (e.matches && !menu.hidden) close(false); });
}

/* --- Navigácia: aktívna položka podľa sekcie vo viewporte --- */
export function initScrollSpy() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".navigation .nav-item")];
  const map = new Map<Element, HTMLAnchorElement>();
  links.forEach(a => { const s = document.querySelector(a.getAttribute("href")!); if (s) map.set(s, a); });
  const visible = new Map<Element, number>();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => visible.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
    let best: Element | null = null, max = 0;
    visible.forEach((r, el) => { if (r > max) { max = r; best = el; } });
    links.forEach(a => { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
    if (best) { const a = map.get(best)!; a.classList.add("is-active"); a.setAttribute("aria-current", "location"); }
  }, { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.01, 0.5, 1] });
  map.forEach((_, s) => io.observe(s));
}

/* --- Newsletter: focus, validácia a stav po odoslaní (bez odosielania dát) --- */
export function initNewsletter() {
  const form = document.querySelector<HTMLFormElement>(".newsletter");
  if (!form) return;
  const msg = form.querySelector<HTMLElement>(".newsletter__msg")!;
  const email = form.querySelector<HTMLInputElement>("input[type=email]")!;
  const consent = form.querySelector<HTMLInputElement>("input[type=checkbox]")!;
  const btn = form.querySelector<HTMLButtonElement>(".newsletter__submit")!;
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (form.classList.contains("is-sent")) return;
    if (!email.checkValidity()) {
      form.classList.add("is-invalid");
      msg.textContent = email.value ? "Skontrolujte, prosím, e-mailovú adresu." : "Zadajte, prosím, váš e-mail.";
      email.focus(); return;
    }
    if (!consent.checked) {
      form.classList.add("is-invalid");
      msg.textContent = "Potvrďte, prosím, súhlas s odberom newslettera.";
      consent.focus(); return;
    }
    form.classList.remove("is-invalid");
    form.classList.add("is-sent");
    email.readOnly = true; consent.disabled = true;
    btn.textContent = "Odoberáte";
    msg.textContent = "Ďakujeme, ste prihlásení na odber. (Prototyp: nič sa neodoslalo.)";
  });
  form.addEventListener("input", () => { if (form.classList.contains("is-invalid")) { form.classList.remove("is-invalid"); msg.textContent = ""; } });
}
