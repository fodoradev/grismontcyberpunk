import type { Locale } from "../lib/i18n";
import { known, site } from "./site";

/**
 * Art still to be supplied (washi dawn look: light, matte, one vermilion accent); docs/asset-prompts.md has the brief for each `promptId`.
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
    brief: { en: "Hero character. 4:5, transparent background, lit softly from the left", hu: "Hős-karakter. 4:5, átlátszó háttér, balról lágyan megvilágítva" },
    alt: { en: "The Flow Samurai: a calm, faceless samurai standing with a sheathed katana, in matte sumi-black armour with one vermilion plate", hu: "A Flow szamuráj: nyugodt, arc nélküli szamuráj hüvelyében pihenő katanával, matt szumi-fekete páncélban, egyetlen cinóberpiros lemezzel" },
  },
  heroCity: {
    src: null,
    file: "/art/hero-city.webp", promptId: "V02", kind: "backdrop", ratio: "21:9",
    width: 2520, height: 1080,
    name: { en: "Dawn city", hu: "Hajnali város" },
    brief: { en: "Hero backdrop. 21:9, pale and empty on the left for the headline", hu: "Hős-háttér. 21:9, bal oldalon világos és üres a címnek" },
    alt: { en: "A quiet Tokyo-style street at dawn in soft mist, with one thin ink line running through it and a vermilion torii far away", hu: "Csendes tokiói hangulatú utca hajnali ködben, rajta egyetlen vékony tusvonal fut végig, a távolban cinóberpiros torii" },
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
    brief: { en: "Offer art. An empty tatami training room with a shoji screen in morning light. 3:2", hu: "Ajánlati kép. Üres tatamis tréningterem shoji ernyővel, reggeli fényben. 3:2" },
    alt: { en: "An empty training room in morning light, a process sketched in ink on a paper screen, seen through a shoji doorway", hu: "Üres tréningterem reggeli fényben, a papírernyőn tussal felvázolt folyamat, shoji ajtónyíláson át nézve" },
  },
  offerWorkshop: {
    src: "{{FILL: workshop offer art, 3:2, WebP}}",
    file: "/art/offer-workshop.webp", promptId: "V06", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Workshops", hu: "Workshopok" },
    brief: { en: "Offer art. A process map of ink threads on a washi table. 3:2", hu: "Ajánlati kép. Tusszálakból álló folyamattérkép egy washi asztalon. 3:2" },
    alt: { en: "A process map made of fine ink threads laid out on a pale washi-paper table, tangled in red on one side and straight on the other", hu: "Finom tusszálakból kirakott folyamattérkép egy világos washi asztalon, az egyik oldalán pirosan összegubancolódva, a másikon egyenesen" },
  },
  offerProgramme: {
    src: "{{FILL: programme offer art, 3:2, WebP}}",
    file: "/art/offer-programme.webp", promptId: "V12", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Programme", hu: "Program" },
    brief: { en: "Offer art. Eight blank paper panels, from one vermilion to one jade. 3:2", hu: "Ajánlati kép. Nyolc üres papírpanel, cinóberpirostól jádezöldig. 3:2" },
    alt: { en: "Eight blank paper panels in a pale corridor, softly lit one after another, the first marked vermilion and the last jade", hu: "Nyolc üres papírpanel egy világos folyosón, egymás után lágyan megvilágítva, az első cinóberpiros, az utolsó jádezöld jelöléssel" },
  },
  offerDelivery: {
    src: "{{FILL: delivery offer art, 3:2, WebP}}",
    file: "/art/offer-delivery.webp", promptId: "V07", kind: "content", ratio: "3:2",
    width: 1200, height: 800,
    name: { en: "Delivery", hu: "Megvalósítás" },
    brief: { en: "Offer art. One clean machine line in a bright, quiet workshop. 3:2", hu: "Ajánlati kép. Egyetlen tiszta gépsor egy világos, csendes műhelyben. 3:2" },
    alt: { en: "One clean machine line of matte white and brushed steel running through a bright workshop, with a single jade indicator", hu: "Egyetlen tiszta, matt fehér és csiszolt acél gépsor fut végig egy világos műhelyen, egyetlen jádezöld jelzőfénnyel" },
  },
  calcBackdrop: {
    src: null,
    file: "/art/backdrop-calculator.webp", promptId: "V08", kind: "backdrop", ratio: "16:9",
    width: 1920, height: 1080,
    name: { en: "Stacked hours", hu: "Felgyűlt órák" },
    brief: { en: "Calculator backdrop. 16:9, pale, quiet, detail only at the edges", hu: "A kalkulátor háttere. 16:9, világos és nyugodt, részletek csak a szélén" },
    alt: { en: "Stacks of paper ledgers in morning light, rising at the edges of a pale room", hu: "Papírfőkönyvek halmai reggeli fényben, egy világos szoba szélein magasodva" },
  },
  methodBackdrop: {
    src: null,
    file: "/art/backdrop-method.webp", promptId: "V09", kind: "backdrop", ratio: "16:9",
    width: 1920, height: 1080,
    name: { en: "Knot to fibre", hu: "A csomótól a szálig" },
    brief: { en: "Method backdrop. 16:9, a knot of cord resolving to one straight line", hu: "A módszer háttere. 16:9, zsinórcsomó, amelyből egyetlen egyenes vonal lesz" },
    alt: { en: "A knot of dark cord on pale paper resolving into one straight jade thread", hu: "Sötét zsinór csomója világos papíron, amelyből egyetlen egyenes jádezöld szál fut ki" },
  },
  contactBackdrop: {
    src: null,
    file: "/art/backdrop-contact.webp", promptId: "V10", kind: "backdrop", ratio: "21:9",
    width: 2520, height: 1080,
    name: { en: "One red lantern", hu: "Egy piros lámpás" },
    brief: { en: "Contact backdrop. 21:9, a dawn skyline with one red lantern-window", hu: "A kapcsolat háttere. 21:9, hajnali látkép egyetlen piros lámpásablakkal" },
    alt: { en: "A pale dawn skyline in mist with one small vermilion lantern in a window", hu: "Világos hajnali városkép ködben, egyetlen ablakban apró cinóberpiros lámpással" },
  },
  notFound: {
    src: null,
    file: "/art/not-found.webp", promptId: "V11", kind: "backdrop", ratio: "16:9",
    width: 1600, height: 900,
    name: { en: "Dead end", hu: "Zsákutca" },
    brief: { en: "Art for the 404 page. 16:9, a line that stops at a wall", hu: "A 404-es oldal képe. 16:9, egy falnál megálló vonal" },
    alt: { en: "A thin ink line running down a pale lane and stopping at a plain wall", hu: "Világos sikátoron végigfutó vékony tusvonal, amely egy sima falnál megáll" },
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
