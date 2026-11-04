import type { Locale } from "../lib/i18n";
import { known, site } from "./site";

/**
 * Art still to be supplied; docs/asset-prompts.md has the brief for each `promptId`.
 * Content slots keep their content-pack marker until the file exists in public/, so `npm run check:launch` lists them
 * and <VisualSlot> draws a labelled frame of the right shape. Replace the marker with the slot's `file` and the image
 * appears. Backdrops are optional atmosphere: `src` stays null, without a marker, until a file exists.
 */
type Visual = {
  src: string | null;
  file: string;
  promptId: string;
  kind: "content" | "backdrop";
  ratio: string;
  width: number;
  height: number;
  name: Record<Locale, string>;
  brief: Record<Locale, string>;
  alt: Record<Locale, string>;
};

export const visuals = {
  samurai: {
    src: "{{FILL: Flow Samurai hero art, 4:5, transparent WebP or SVG}}",
    file: "/art/flow-samurai.webp", promptId: "V01", kind: "content", ratio: "4:5",
    width: 960, height: 1200,
    name: { en: "Flow Samurai", hu: "Flow szamuráj" },
    brief: { en: "Hero character. 4:5, transparent background", hu: "Hős-karakter. 4:5, átlátszó háttér" },
    alt: { en: "The Flow Samurai: a calm, faceless samurai in charcoal and silver with a crimson plate", hu: "A Flow szamuráj: nyugodt, arc nélküli szamuráj szénszürkében és ezüstben, karmazsin vérttel" },
  },
  heroCity: {
    src: null,
    file: "/art/hero-city.webp", promptId: "V02", kind: "backdrop", ratio: "21:9",
    width: 2520, height: 1080,
    name: { en: "Night city", hu: "Éjszakai város" },
    brief: { en: "Hero backdrop. 21:9, dark on the left for the headline", hu: "Hős-háttér. 21:9, bal oldalon sötét a címnek" },
    alt: { en: "A rain-wet alley at night with one lit line running through it", hu: "Esőtől nedves sikátor éjszaka, rajta egyetlen világító vonal fut végig" },
  },
  portrait: {
    src: site.photo,
    file: "/art/attila-portrait.webp", promptId: "V03", kind: "content", ratio: "4:5",
    width: 960, height: 1200,
    name: { en: "Attila", hu: "Attila" },
    brief: { en: "Real portrait, graded to match. 4:5, friendly, in a work setting", hu: "Valódi portré, a stílushoz színezve. 4:5, barátságos, munka közben" },
    alt: { en: "Attila at work", hu: "Attila munka közben" },
  },
  training: {
    // Optional, and real photos only: it appears in the about section once a file exists. Absent, nothing is missing.
    src: null,
    file: "/art/team-training.webp", promptId: "V04", kind: "content", ratio: "16:9",
    width: 1600, height: 900,
    name: { en: "Team training", hu: "Csapattréning" },
    brief: { en: "Real photo of a real session, graded to match. Landscape", hu: "Valódi fotó egy valódi alkalomról, a stílushoz színezve. Fekvő" },
    alt: { en: "A team mapping a process together during a training day", hu: "Egy csapat közösen térképez fel egy folyamatot a tréningnapon" },
  },
  offerTraining: {
    src: "{{FILL: training offer art, 3:2, WebP}}",
    file: "/art/offer-training.webp", promptId: "V05", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Training", hu: "Tréning" },
    brief: { en: "Offer art. An empty whiteboard room seen through rain glass. 3:2", hu: "Ajánlati kép. Üres táblás terem esős üvegen át. 3:2" },
    alt: { en: "An empty training room at night with a process sketched on the whiteboard, seen through rain on glass", hu: "Üres tréningterem éjszaka, a táblán felvázolt folyamattal, esős üvegen át nézve" },
  },
  offerWorkshop: {
    src: "{{FILL: workshop offer art, 3:2, WebP}}",
    file: "/art/offer-workshop.webp", promptId: "V06", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Workshops", hu: "Workshopok" },
    brief: { en: "Offer art. A process map of glowing threads on a table. 3:2", hu: "Ajánlati kép. Világító szálakból álló folyamattérkép egy asztalon. 3:2" },
    alt: { en: "A process map made of glowing threads laid out on a dark table", hu: "Világító szálakból kirakott folyamattérkép egy sötét asztalon" },
  },
  offerProgramme: {
    src: "{{FILL: programme offer art, 3:2, WebP}}",
    file: "/art/offer-programme.webp", promptId: "V12", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Programme", hu: "Program" },
    brief: { en: "Offer art. Eight blank panels lighting from crimson to mint. 3:2", hu: "Ajánlati kép. Nyolc üres panel, karmazsintól mentaszínig világítva. 3:2" },
    alt: { en: "Eight blank wall panels in a dark corridor, lit one after another from crimson to mint", hu: "Nyolc üres falpanel egy sötét folyosón, egymás után karmazsintól mentaszínig megvilágítva" },
  },
  offerDelivery: {
    src: "{{FILL: delivery offer art, 3:2, WebP}}",
    file: "/art/offer-delivery.webp", promptId: "V07", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Delivery", hu: "Megvalósítás" },
    brief: { en: "Offer art. One clean machine line, running. 3:2", hu: "Ajánlati kép. Egyetlen tiszta, működő gépsor. 3:2" },
    alt: { en: "One clean machine line running through a dark workshop, lit along its length", hu: "Egyetlen tiszta gépsor fut végig egy sötét műhelyen, teljes hosszában megvilágítva" },
  },
  calcBackdrop: {
    src: null,
    file: "/art/backdrop-calculator.webp", promptId: "V08", kind: "backdrop", ratio: "16:9",
    width: 1920, height: 1080,
    name: { en: "Stacked hours", hu: "Felgyűlt órák" },
    brief: { en: "Calculator backdrop. 16:9, very dark and quiet", hu: "A kalkulátor háttere. 16:9, nagyon sötét és nyugodt" },
    alt: { en: "Stacks of wet paper ledgers in a dark room, lit from one side", hu: "Nedves papírfőkönyvek halmai sötét szobában, egy oldalról megvilágítva" },
  },
  methodBackdrop: {
    src: null,
    file: "/art/backdrop-method.webp", promptId: "V09", kind: "backdrop", ratio: "16:9",
    width: 1920, height: 1080,
    name: { en: "Knot to fibre", hu: "A csomótól a szálig" },
    brief: { en: "Method backdrop. 16:9, a cable knot resolving to one lit fibre", hu: "A módszer háttere. 16:9, kábelcsomó, amelyből egyetlen világító szál lesz" },
    alt: { en: "A knot of dark cables resolving into one lit fibre", hu: "Sötét kábelek csomója, amelyből egyetlen világító szál fut ki" },
  },
  contactBackdrop: {
    src: null,
    file: "/art/backdrop-contact.webp", promptId: "V10", kind: "backdrop", ratio: "21:9",
    width: 2520, height: 1080,
    name: { en: "One lit window", hu: "Egy világító ablak" },
    brief: { en: "Contact backdrop. 21:9, a dark skyline with one lit window", hu: "A kapcsolat háttere. 21:9, sötét látkép egyetlen világító ablakkal" },
    alt: { en: "A dark city skyline in the rain with one window lit", hu: "Sötét városi látkép esőben, egyetlen világító ablakkal" },
  },
  notFound: {
    src: null,
    file: "/art/not-found.webp", promptId: "V11", kind: "backdrop", ratio: "16:9",
    width: 1600, height: 900,
    name: { en: "Dead end", hu: "Zsákutca" },
    brief: { en: "Art for the 404 page. 16:9, a line that stops at a wall", hu: "A 404-es oldal képe. 16:9, egy falnál megálló vonal" },
    alt: { en: "A lit line running down an alley and stopping at a wall", hu: "Sikátoron végigfutó világító vonal, amely egy falnál megáll" },
  },
} satisfies Record<string, Visual>;

export type VisualId = keyof typeof visuals;
export type BackdropId = { [K in VisualId]: (typeof visuals)[K]["kind"] extends "backdrop" ? K : never }[VisualId];

export function getVisual(id: VisualId, locale: Locale) {
  const v: Visual = visuals[id];
  return { src: known(v.src), file: v.file, promptId: v.promptId, kind: v.kind, ratio: v.ratio, width: v.width, height: v.height, name: v.name[locale], brief: v.brief[locale], alt: v.alt[locale] };
}

/** The backdrop's path once its file exists, otherwise null: the section then rests on its CSS atmosphere. */
export function getBackdrop(id: BackdropId): string | null {
  const v: Visual = visuals[id];
  return known(v.src) ?? null;
}
