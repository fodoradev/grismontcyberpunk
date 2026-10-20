import type { Quadrant, ReportModel } from "../../../lib/scorecard/types";

/** A webes riport és a PDF közös szövegei. */

export const QUADRANT_TEXT: Record<Quadrant, { title: string; text: string }> = {
  "automate-now": { title: "Automatizálható", text: "Sok a szabályok szerint végzett kézi munka, és megvannak a biztonságos automatizálás alapjai. Itt térül meg leggyorsabban az automatizálás." },
  "fix-first": { title: "Előbb az alapok", text: "Sok a kézi munka, de a folyamatlépések, az adatok vagy a rendszerek még nem állnak készen. Ha most automatizálnátok, a meglévő hibák is bebetonozódnának." },
  "ready-low-volume": { title: "Kevés ismétlődő munka", text: "Megvannak az automatizálás feltételei, de kevés az olyan ismétlődő munka, amelyet ki lehetne váltani. Gondosan válasszátok meg, mit automatizáltok." },
  "low-priority": { title: "Más terület fontosabb", text: "Kevés a szabályok szerint végzett kézi munka, és az automatizálási felkészültség is alacsony. A következő komolyabb javulást máshol érdemes keresni." },
};

export const ROADMAP_COLUMNS = [
  { key: "d30", label: "1–30. nap", sub: "A munka megértése és a biztonságos alapok" },
  { key: "d60", label: "31–60. nap", sub: "Egységes munkavégzés és a veszteségek csökkentése" },
  { key: "d90", label: "61–90. nap", sub: "Automatizálás, AI és az eredmények megtartása" },
] as const;

const decimal = (value: number) => value.toLocaleString("hu-HU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const capNote = (r: ReportModel) =>
  `Az AI-ra adott válaszaid alapján a pontszám ${decimal(r.ai.raw)} (ezt mutatja a világos sáv), de az AI csak annyira lehet megbízható, amennyire a mögötte lévő folyamat és adatok. Amíg a stabilitás és az adatminőség nem javul, az értékelésben ${decimal(r.ai.shown)} pontot számolunk.`;

export const automationCapNote = (r: ReportModel) =>
  `Csak az automatizálási kérdésekre adott válaszaid alapján a felkészültség ${decimal(r.automation.readinessRaw)} pont lenne, de az értékelésben ${decimal(r.automation.readiness)} pontot számolunk. Az automatizálás a hibáival együtt másolja le a folyamatot, ezért a felkészültség nem lehet magasabb annál, amit a folyamat stabilitása és az adatminőség megenged.`;

export const QUADRANT_AXES = { up: "Több szabályok szerint végzett kézi munka", right: "Nagyobb automatizálási felkészültség" };

/** A riport címe alatti bevezető. */
export const reportIntro = (r: ReportModel) =>
  `${r.process ? `A vizsgált („${r.process}”) folyamatról adott válaszaid alapján. ` : ""}Hat terület értékelése 0–4 pontos skálán. A sorrend számít: előbb a folyamat alapjai, aztán az automatizálás, végül az AI.`;

export const freeTextLabel = (r: ReportModel) => (r.process ? `Mi okoz gondot a vizsgált („${r.process}”) folyamatban?` : "Mi okoz gondot?");

export const formatReportDate = (r: ReportModel) =>
  new Date(r.createdAt).toLocaleDateString("hu-HU", { day: "numeric", month: "long", year: "numeric" });

/** A szabadon megadott folyamatnév írásmódját, köztük a rövidítéseket is, változatlanul hagyjuk. */
export const midSentence = (name: string) => name;
