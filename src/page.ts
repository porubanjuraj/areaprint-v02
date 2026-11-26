/**
 * Homepage v02 (Figma sekcia 58:4975, desktop 97:3346, mobil 113:1195).
 * Texty z Figmy. Hero „Jeden partner od tlače po montáž“ (upravené 26. 11. 2026).
 */
import { Button, Chip, ClientLogo } from "./components/core";
import {
  CtaBanner, Footer, MagazineCards, MobileLink, MobileMenu, Navigation, ProcessStairs, RealizationsSlider,
  SectionHead, SolutionsIndex, TechTiles, type Realization, type Solution,
} from "./components/blocks";

// poradie log podľa Figmy (97:3296)
const LOGOS = ["Mecom", "Mirinda", "Pepsi", "Amundsen", "Božkov", "Mattoni", "Posmedia", "YIT", "Poštová banka", "Schweppes", "UniCredit Bank"];
const LOGO_ROW = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 10];

const SOLUTIONS: Solution[] = [
  { icon: "posstand", title: "Retail a predajné miesta", text: "POS materiály, kartónové stojany a komunikácia v predajniach.", photo: "sol_retail", alt: "Svetlá predajňa s drevenými pultmi a vystaveným tovarom", href: "#" },
  { icon: "billboard", title: "Kampane a veľkoplošná reklama", text: "Outdoorové formáty, bannery a polepy pre vašu komunikáciu.", photo: "sol_kampane", alt: "Prázdny podsvietený reklamný panel na zastávke v noci", href: "#" },
  { icon: "booth", title: "Výstavy a eventy", text: "Prezentačné systémy, steny a materiály na podujatia.", photo: "sol_vystavy", alt: "Výstavný stánok s veľkoformátovou grafikou a pultom", href: "#" },
  { icon: "signpost", title: "Orientačné systémy", text: "Označenie, polepy a vizuálne prvky pre vaše priestory.", photo: "sol_orientacne", alt: "Svetelný nápis WAY so šípkou zo žiaroviek", href: "#" },
  { icon: "box", title: "Firemné tlačoviny a obaly", text: "Tlačové materiály, kartónové obaly a balenia na mieru.", photo: "sol_tlacoviny", alt: "Kartónové priečky v krabici zblízka", href: "#" },
];

const STEPS = [
  { num: "01", label: "Pochopíme<br> zadanie" },
  { num: "02", label: "Navrhneme<br> riešenie" },
  { num: "03", label: "Zameriame<br> a pripravíme" },
  { num: "04", label: "Vyrobíme<br> na mieru" },
  { num: "05", label: "Dodáme<br> a nainštalujeme", highlight: true },
];

const REALIZATIONS: Realization[] = [
  { chip: "Retail", title: "Uvedenie produktu v predajni", chapter: "Uvedenie produktu<br> v predajni", text: "Kartónový stojan, POS materiály<br class=\"br-m\"> a polepy<br class=\"br-d\"> ako jedno zadanie.", photo: "real_predajna", alt: "Interiér obchodného domu s predajnými ostrovčekmi", href: "#" },
  { chip: "Kampane", title: "Kampaň vo verejnom priestore", chapter: "Kampaň vo verejnom priestore", text: "Viacero reklamných formátov<br> v jednom produkčnom procese.", photo: "real_kampan", alt: "Billboard pri ceste vo večernom svetle", href: "#" },
  { chip: "Výstavy a eventy", title: "Prezentácia značky na podujatí", chapter: "Prezentácia značky<br> na podujatí", text: "Prezentačná stena, označenie<br> a sprievodné tlačoviny.", photo: "real_podujatie", alt: "Plná výstavná hala s návštevníkmi z vtáčej perspektívy", href: "#" },
];

const TECH = [
  { icon: "t1" as const, label: "Veľkoplošná<br> digitálna tlač", href: "#" },
  { icon: "t2" as const, label: "Maloplošná<br> digitálna tlač", href: "#" },
  { icon: "t3" as const, label: "Produkty<br> z kartónu", href: "#" },
  { icon: "t4" as const, label: "Prezentačné<br> systémy", href: "#" },
  { icon: "t5" as const, label: "Návrhy<br class=\"br-d\"> a dizajn", href: "#" },
  { icon: "t6" as const, label: "Finalizácia<br> a inštalácia", href: "#" },
];

const ARTICLES = [
  { chip: "Proces", title: "Dobré riešenie sa začína správnymi otázkami", meta: "4 min čítania", photo: "mag_otazky", alt: "Vzorkovník farieb Pantone", href: "#" },
  { chip: "Kampane", title: "Jedna kampaň, viac formátov, jeden celok.", meta: "4 min čítania", photo: "mag_kampan", alt: "Veľkoformátová tlačiareň počas tlače", href: "#" },
  { chip: "Materiály", title: "Materiál vyberáme pre konkrétne použitie", meta: "4 min čítania", photo: "mag_material", alt: "Tri vzorky papiera rôznych farieb a štruktúr", href: "#" },
];

const inlinePhoto = (name: string, alt: string, cls = "") =>
  `<span class="hero__photo ${cls}"><img src="/img/${name}-320.webp" srcset="/img/${name}-320.webp 320w, /img/${name}-640.webp 640w" sizes="(min-width: 1024px) 9rem, 4.5rem" alt="${alt}" fetchpriority="high"></span>`;

function Hero() {
  return `<section class="hero raster-tile" data-raster="hero" aria-labelledby="hero-title">
  <canvas class="raster-tile__canvas" aria-hidden="true"></canvas>
  <header class="site-header">${Navigation()}</header>
  <div class="hero__content">
    <div class="hero__head" data-reveal>
      ${Chip({ label: "Vlastná výroba a 30 rokov skúseností", tone: "subtle" })}
      <h1 class="hero__title" id="hero-title">
        <span class="hero__line">Jeden partner ${inlinePhoto("hero_tlac", "Ruka v rukavici vyberá čerstvo vytlačený hárok", "hero__photo--crop")}</span>
        <span class="hero__line">od tlače ${inlinePhoto("hero_dielna", "Pracovníčka pri príprave tlače v dielni")} <span class="hero__tail">po montáž</span></span>
      </h1>
    </div>
    <div class="hero__bottom" data-reveal style="--reveal-delay:100ms">
      <p class="hero__lead t-body-m muted"><span class="copy-d">Nemusíte koordinovať grafika, tlačiareň a montážnikov.<br> Celé zadanie prevezmeme a odovzdáme hotové priamo na mieste.</span><span class="copy-m">Navrhneme, technicky pripravíme, vyrobíme a nainštalujeme. Zastrešíme celý proces, aby ste sa mohli venovať svojmu biznisu.</span></p>
      <div class="hero__actions">
        ${Button({ label: "Tlač na mieru", href: "#kontakt", style: "accent", size: "m", cls: "btn--h44" })}
        ${Button({ label: "Realizácie", href: "#realizacie", style: "outline", size: "m", cls: "btn--h44" })}
      </div>
    </div>
  </div>
  <div class="hero__logos" data-reveal style="--reveal-delay:200ms">
    <h2 class="visually-hidden">Klienti</h2>
    <div class="marquee" data-marquee="time" data-dir="-1" data-align="center"><div class="marquee__track">${LOGO_ROW.map(i => ClientLogo({ file: `clientlogo_${i}`, name: LOGOS[i] })).join("")}</div></div>
  </div>
</section>`;
}

export function renderPage() {
  const allSolutions = { label: "Všetky riešenia", href: "#" };
  const allReal = { label: "Všetky realizácie", href: "#" };
  const mag = { label: "Vstúpiť do magazínu", href: "#" };
  return `<a class="skip-link" href="#obsah">Preskočiť na obsah</a>
<div class="page" id="top">
  ${MobileMenu()}
  ${Hero()}
  <main id="obsah" class="page__main">
    <section class="sec sec--base sec--solutions" id="riesenia" aria-labelledby="riesenia-title">
      ${SectionHead({ id: "riesenia", title: "Čo potrebujete vyriešiť?", link: allSolutions })}
      ${SolutionsIndex(SOLUTIONS)}
      ${MobileLink(allSolutions)}
    </section>

    <section class="sec sec--subtle" id="proces" aria-labelledby="proces-title">
      ${SectionHead({ id: "proces", title: "Jeden partner,<br class=\"br-m\"> celý proces" })}
      <div class="proces">
        ${ProcessStairs(STEPS)}
        ${CtaBanner()}
      </div>
    </section>

    <section class="sec sec--base" id="realizacie" aria-labelledby="realizacie-title">
      ${SectionHead({ id: "realizacie", title: "Schopnosti ukážeme<br> na výsledkoch", link: allReal, align: "end" })}
      ${RealizationsSlider(REALIZATIONS)}
      ${MobileLink(allReal)}
    </section>

    <section class="sec sec--base sec--tech" id="technologie" aria-labelledby="technologie-title">
      <div class="tech on-dark raster-tile" data-raster="tech">
        <canvas class="raster-tile__canvas" aria-hidden="true"></canvas>
        <div class="tech__head">
          <h2 class="tech__title t-display-l" id="technologie-title" data-reveal>Technológie v službách vášho zadania</h2>
          <p class="tech__text t-body-m" data-reveal style="--reveal-delay:80ms">Od firemných tlačovín po veľkoplošnú reklamu a kartónové riešenia. Produkty, materiály<br class="br-d"> a spracovanie vyberáme podľa toho, čo potrebujete dosiahnuť.</p>
        </div>
        ${TechTiles(TECH)}
      </div>
    </section>

    <section class="sec sec--base sec--mag" id="magazin" aria-labelledby="magazin-title">
      ${SectionHead({ id: "magazin", title: "Čo sa deje<br class=\"br-m\"> za výsledkom", link: mag })}
      ${MagazineCards(ARTICLES)}
      ${MobileLink(mag)}
    </section>
  </main>
  ${Footer()}
</div>`;
}
