import { type AreaId, type Industry, type Option, type Question, type SizeBand } from "../../../lib/scorecard/types";

/** A pontozott válaszok indexe a 0–4 közötti pontszám; a sorrend a modell része. */
const opts = (labels: string[]): Option[] => labels.map((label, i) => ({ id: `o${i}`, label, score: i }));
/** A nem pontozott válaszok név szerinti azonosítóira az értékelési szabályok hivatkoznak. */
const named = (options: Record<string, string>): Option[] => Object.entries(options).map(([id, label]) => ({ id, label }));

const scored = (id: string, area: AreaId, short: string, prompt: string, labels: string[], extra: Partial<Question> = {}): Question =>
  ({ id, area, short, prompt, kind: "scored", options: opts(labels), ...extra }) as Question;

export const AREA_NAMES: Record<AreaId, string> = {
  FW: "Munkafolyamat és veszteségek",
  SS: "Stabilitás és egységes munkavégzés",
  DM: "Adatok és mérés",
  AP: "Automatizálási lehetőségek",
  AI: "AI-felkészültség",
  PO: "Emberek és felelősségek",
};

export const AREA_INTROS: Record<AreaId, string> = {
  FW: "Hogyan halad a munka, és hol akad el?",
  SS: "Ugyanúgy készül-e el ugyanaz a munka, bárki is csinálja?",
  DM: "Megbízhatók-e a számok, és tényleg ezek alapján döntötök-e?",
  AP: "Mennyi az olyan kézi munka, amely kötött szabályok szerint megy, és átvehetné-e egy szoftver?",
  AI: "Megvannak-e azok az adatok, leírt tudás és szabályok, amelyekkel a mesterséges intelligencia (AI) hasznosan és biztonságosan használható?",
  PO: "Ki gondoskodik róla, hogy a fejlesztések eredménye a projekt után is megmaradjon?",
};

export const SIZE_LABELS: Record<SizeBand, string> = { "1-10": "1–10 fő", "11-50": "11–50 fő", "51-250": "51–250 fő", "250+": "250+ fő" };
export const INDUSTRY_LABELS: Record<Industry, string> = {
  manufacturing: "Gyártás vagy logisztika",
  services: "Szolgáltatás ügyfeleknek (ügynökség, tanácsadás, szakipar, egészségügy…)",
  office: "Főként irodai és adminisztratív munka (pénzügy, HR, back office)",
  other: "Egyéb",
};

/**
 * A {process} helyére a nyitókérdésben megadott név kerül, eredeti írásmóddal.
 * A név idézőjelben, ragozás nélkül szerepel; a teljes cégre vonatkozó kérdésekben nem használjuk.
 */
export const PROCESS_ID = "P1";

export const QUESTIONS: Question[] = [
  { id: PROCESS_ID, kind: "text", required: true, short: "A vizsgált folyamat", maxLength: 80,
    prompt: "Melyik folyamatot nézzük meg közelebbről?",
    help: "Azt válaszd, amelyet a legjobban ismersz, vagy amelyik a legtöbb gondot okozza. A további kérdések erről a folyamatról szólnak, kivéve néhányat, amely a cég egészére vonatkozik.",
    placeholder: "Pl. árajánlatkészítés, hó végi számlázás, a rendeléstől a kiszállításig" },

  // Munkafolyamat és veszteségek
  scored("FW1", "FW", "Egyórás feladat átfutási ideje", "Vegyünk egy tipikus feladatot a vizsgált („{process}”) folyamatban, amely nagyjából egyórányi tényleges munka. Attól számítva, hogy a kérés beérkezik, általában mikorra készül el?",
    ["Nem lehet megmondani, nagyon változó", "1–2 héten belül", "Néhány napon belül", "Még aznap vagy másnap", "Még aznap vagy másnap, és az átfutási időt mérjük is"]),
  { id: "FW2", area: "FW", kind: "diag", short: "Hol várakozik a feladat?", prompt: "Ennél a feladatnál mire megy el a legtöbb idő?",
    options: named({ approval: "Jóváhagyásra vár", inbox: "Ott áll valakinek a postafiókjában vagy a teendői között", info: "Másik csapat vagy az ügyfél információjára vár", rework: "Javítják vagy újracsinálják", working: "Ténylegesen dolgoznak rajta", unknown: "Nem tudom" }) },
  scored("FW3", "FW", "Milyen gyakran kell javítani a munkát?", "A vizsgált („{process}”) folyamatban milyen gyakran kell egy feladatot javítani vagy újracsinálni, mert hiányos, hibás vagy nem egyértelmű volt az információ?",
    ["Állandóan, ez a munka része", "A legtöbb héten akad komolyabb ilyen eset", "Rendszeresen, és ismerjük a jellemző okokat", "Alkalmanként", "Ritkán, és ilyenkor az okot is megszüntetjük"]),
  scored("FW4", "FW", "A feladatok átadása", "Amikor a vizsgált („{process}”) folyamatban a munka egyik embertől a másikhoz kerül, honnan tudja a következő munkatárs, hogy ő van soron?",
    ["Szólnak neki, vagy ő kérdez rá", "E-mailből vagy chatből, de néha valami elsikkad", "Közös listáról vagy tábláról, amely nem mindig naprakész", "Olyan feladatlistából vagy rendszerből, amelyet tényleg mindenki használ", "Olyan feladatlistából, amely korlátozza, mennyi munka lehet egyszerre folyamatban, és jelzi a csúszó tételeket"]),
  scored("FW5", "FW", "Keresgélésre, utánajárásra és várakozásra menő idő", "A vizsgált („{process}”) folyamatban dolgozóknak egy átlagos héten nagyjából a munkaidejük mekkora része megy el információ keresésére, annak tisztázására, hol tart egy feladat, vagy másokra várásra?",
    ["Legalább 30%", "20–30%", "10–20%", "5–10%", "Kevesebb mint 5%"]),

  // Stabilitás és egységes munkavégzés
  scored("SS1", "SS", "Az új munkatársak betanulása", "Hogyan tanulja meg a munkát az, aki először vesz részt a vizsgált („{process}”) folyamatban?",
    ["Azt kérdezgeti, aki éppen ráér", "Egy konkrét kolléga mellett tanul bele", "Többnyire naprakész jegyzetekből", "Írásos munkaleírásból, amelyet a folyamat változásakor frissítünk", "Írásos munkaleírásból; az eltéréseket feljegyezzük, és ezek alapján frissítjük a leírást"]),
  scored("SS2", "SS", "Két munkatárs eredményének egyezése", "Ha két munkatárs ugyanazt a feladatot végzi el a vizsgált („{process}”) folyamatban, milyen gyakran lesz érdemben más az eredményük?",
    ["Gyakran, és ez az ügyfél vagy a vezető panaszából derül ki", "Gyakran, de az ellenőrzéseink a legtöbbet kiszűrik", "Néha", "Ritkán, mert közös sablont vagy ellenőrzőlistát használunk", "Ritkán, és ezt mérjük is"]),
  scored("SS3", "SS", "Mi történik a kulcsember távollétében?", "Mi történne, ha a vizsgált („{process}”) folyamatot legjobban ismerő munkatárs két hétig távol lenne?",
    ["A folyamat nagyrészt leállna", "Nehezen haladna, és közben őt hívogatnánk", "A többiek megoldanák, de lennének hibák", "A többiek a dokumentáció alapján megoldanák", "Semmi különös; rendszeresen cseréljük egymást a feladatokban, így ez megszokott"]),
  scored("SS4", "SS", "A kivételek kezelése", "Mit csináltok a kivételekkel a vizsgált („{process}”) folyamatban, például a szokatlan rendelésekkel, egyedi ügyféligényekkel vagy ritka esetekkel?",
    ["Mindenki a maga módján", "Mindig ugyanahhoz a tapasztalt kollégához vagy vezetőhöz fordulunk", "Vannak bevett szabályok, de csak az emberek fejében", "A gyakori esetekre írásos szabályok vannak", "Írásos szabályok vannak, és az új típusú kivételeket is felvesszük közéjük"]),
  scored("SS5", "SS", "A folyamat változásainak kommunikálása", "Ha változik valami a vizsgált („{process}”) folyamatban, hogyan értesül erről mindenki, akit érint?",
    ["Akkor derül ki, amikor valami elcsúszik", "Szájról szájra terjed", "E-mailben vagy megbeszélésen, de a dokumentumok nem frissülnek", "Frissítjük a dokumentumokat, és jelezzük a változást", "Frissítjük, jelezzük, és néhány hét múlva megnézzük, hogy tényleg így dolgoznak-e"]),

  // Adatok és mérés
  scored("DM1", "DM", "A hibaarány ismerete", "Fejből meg tudnád mondani, hogy a vizsgált („{process}”) folyamatban a múlt hónapban a feladatok hány százaléka volt hibás, vagy kellett újracsinálni?",
    ["Nem mérjük", "Mérjük, de utána kellene néznem", "Nagyjából tudom, de nem vagyok biztos a pontosságában", "Igen, a rendszeres riportból", "Igen, és azt is tudom, hogyan alakul, és mik a fő okai"]),
  scored("DM2", "DM", "A vezetői mutatók adatforrása", "Honnan jönnek a számok, amelyeket a vezetői megbeszéléseken vagy a KPI-k áttekintésekor használtok?",
    ["Nincs ilyen rendszeres áttekintés", "Valaki több fájlból, kézzel állítja össze őket", "Részben automatizált táblázatból", "Többnyire közvetlenül a rendszereinkből, néhány kézi javítással", "Közvetlenül a rendszereinkből, és a mutatók definíciója írásban is megvan"]),
  scored("DM3", "DM", "Ugyanarra a kérdésre ugyanaz a szám", "Ha két kolléga ugyanazt a számot nézi meg, például a múlt havi árbevételt vagy a nyitott rendeléseket, ugyanazt kapják?",
    ["Ritkán", "Gyakran nem, és ebből vita lesz", "Egyeztetés után általában igen", "Többnyire igen", "Igen, mert közös definíciót és egyetlen adatforrást használunk"]),
  scored("DM4", "DM", "A döntések alapja", "Amikor a vizsgált („{process}”) folyamat egy problémájáról döntötök, általában mi alapján?",
    ["Annak a véleménye alapján, aki a legmagasabb beosztású, vagy a leghangosabb", "Egy friss panasz vagy egyedi eset alapján", "Az adott alkalomra összeszedett adatok alapján", "Rendszeresen áttekintett adatok alapján", "A mért kiinduló állapothoz viszonyítva, és utólag az eredményt is megmérjük"]),
  scored("DM5", "DM", "Saját fájlokban és postafiókokban lévő adatok", "A működéshez fontos adatok mekkora része van saját táblázatokban vagy e-mailekben egy közös rendszer helyett?",
    ["A túlnyomó része", "Nagy része", "Körülbelül a fele", "Kisebb része", "Nagyon kevés"]),

  // Automatizálási lehetőségek
  scored("AP1", "AP", "Adatok másolására és újragépelésére menő idő", "A vizsgált („{process}”) folyamatban összesen nagyjából hány munkaóra megy el hetente arra, hogy adatokat másoltok vagy gépeltek át rendszerek, fájlok és e-mailek között?",
    ["Kevesebb mint 2 óra", "2–5 óra", "5–15 óra", "15–40 óra", "Legalább 40 óra"], { sub: "opportunity" }),
  scored("AP2", "AP", "Az ismétlődő munka szabályszerűsége", "A vizsgált („{process}”) folyamat ismétlődő feladatai közül hány megy kötött szabályok szerint, vagyis ugyanabból a bemenetből mindig ugyanazok a lépések következnek?",
    ["Szinte egy sem", "Kevés", "Néhány", "Sok", "A legtöbb"], { sub: "opportunity" }),
  scored("AP3", "AP", "A lépések szabályokba foglalhatósága", "Le tudnád írni most rögtön a vizsgált („{process}”) folyamat leggyakrabban ismétlődő feladatát „ha…, akkor…” szabályokkal, anélkül, hogy bárkit megkérdeznél?",
    ["Nem", "Csak az alapesetet", "Segítséggel az alapesetet és a gyakori kivételeket is", "Igen", "Már most is így van leírva"], { sub: "readiness" }),
  scored("AP4", "AP", "Hozzá lehet-e férni az adatokhoz a rendszerekből?", "Ki lehet szedni az adatokat a vizsgált („{process}”) folyamatban használt rendszerekből, például exporttal, API-n vagy integráción keresztül?",
    ["Nem tudom", "Csak kézi exporttal", "Néhány rendszerből igen", "A legtöbből igen, és már éltünk is ezzel", "Már most is vannak működő integrációink"], { sub: "readiness" }),
  scored("AP5", "AP", "A legutóbb bevezetett eszköz sorsa", "Mi lett a legutóbb bevezetett automatizálással vagy szoftverrel?",
    ["Abbahagytuk a használatát", "Még nem vezettünk be ilyet", "Működik, de csak egy ember tudja megjavítani", "Működik, és van kijelölt felelőse", "Működik, van felelőse és dokumentációja, és megmértük a megtakarított időt"], { sub: "readiness" }),

  // AI-felkészültség
  scored("AI1", "AI", "Milyen adat kerülhet AI-eszközökbe?", "Van szabály arra, hogy milyen céges vagy ügyféladat kerülhet AI-eszközökbe?",
    ["Nincs, mindenki úgy használja, ahogy jónak látja", "Az AI tilos, de valószínűleg így is használják", "Vannak íratlan iránymutatások", "Van írásos szabály, és mindenki ismeri", "Van írásos szabály, és jóváhagyott eszközöket használunk céges fiókokkal"]),
  scored("AI2", "AI", "Az AI jelenlegi használata", "Hogyan használjátok most az AI-t a cégnél?",
    ["A kollégák ingyenes eszközöket használnak munkára, de nem tudjuk, mire", "Egyáltalán nem használjuk", "Néhányan szövegíráshoz és összefoglalókhoz használják", "Bizonyos munkakörökben, konkrét feladatokra, megbeszélt módon", "Konkrét felhasználási területeken, mért eredménnyel"]),
  scored("AI3", "AI", "A szükséges tudás dokumentálása", "Hol van leírva az a tudás, amely egy tipikus, a vizsgált („{process}”) folyamatot érintő kérdés megválaszolásához kell?",
    ["Csak a kollégák fejében", "Szétszórt fájlokban és régi e-mailekben", "Közös meghajtón, de részben elavult", "Rendszeresen karbantartott tudásbázisban", "Karbantartott tudásbázisban, kijelölt felelőssel és felülvizsgálati időpontokkal"]),
  scored("AI4", "AI", "Az AI eredményének ellenőrzése", "Ha egy AI-eszköz választ vagy döntési javaslatot adna, honnan tudnátok, hogy helyes?",
    ["Nem lenne módunk ellenőrizni", "Valaki elolvasná, és eldöntené, jó-e", "Kézzel összevetnénk korábbi példákkal", "Világos szempontjaink vannak arra, milyen a jó eredmény", "Világos szempontjaink és tesztelésre használható korábbi eseteink is vannak"]),
  scored("AI5", "AI", "Konkrét, számszerűsített probléma az AI számára", "Van olyan konkrét probléma, amelyet AI-val szeretnétek megoldani, és számokkal is meg tudjátok fogni?",
    ["Nincs, csak úgy érezzük, hogy kellene valamit kezdenünk az AI-val", "Általános ötleteink vannak", "Van konkrét felhasználási eset, de számok nélkül", "Van konkrét eset, becsült költség- vagy időmegtakarítással", "Van konkrét eset, mért kiindulási állapottal"]),

  // Munkatársak és felelősségek
  scored("PO1", "PO", "A fejlesztések eredményének tartóssága", "Gondolj a vizsgált („{process}”) folyamat legutóbbi fejlesztésére. Három hónappal később is az új módon dolgoztok?",
    ["Nem jut eszembe ilyen fejlesztés", "Idővel visszaálltunk a régire", "Részben", "Igen", "Igen, és ezt valaki ellenőrzi is"]),
  scored("PO2", "PO", "A teljes folyamat felelőse", "Ki a vizsgált („{process}”) folyamat név szerinti felelőse az elejétől a végéig?",
    ["Senki", "Mindenki csak a saját részéért felel", "Nem hivatalosan egy vezető", "Van név szerint kijelölt felelős", "Van kijelölt felelős, aki döntési jogkört és hozzá illő KPI-t is kapott"]),
  scored("PO3", "PO", "Mi történik a jelzett problémákkal?", "Ha valaki a vizsgált („{process}”) folyamatban észrevesz egy problémát, általában mi történik?",
    ["Megoldja valahogy, és megy tovább", "Szól valakinek, de ritkán változik bármi is", "Néha megoldjuk", "Rendszeresen van alkalom a problémák felvetésére és nyomon követésére", "Felírjuk, követjük, megszüntetjük a kiváltó okot, és aki jelezte, visszajelzést kap"]),
  scored("PO4", "PO", "Idő a fejlesztésekre", "A napi feladatok mellett mennyi idő jut a kollégáknak fejlesztésekre?",
    ["Semmi", "Csak munkaidő után, vagy ha nagy a baj", "Néha, ha egy vezető erőlteti", "Néhány munkatársnak van erre tervezett ideje", "Van erre előre beosztott idő, amit más nem vihet el, és az eredményeket is átnézzük"]),
  scored("PO5", "PO", "Hogyan fogadják a rossz híreket?", "Hogyan reagál a vezetés, ha valaki megmutatja, hogy egy folyamat rosszabbul működik, mint gondolták?",
    ["A hírhozón csattan az ostor", "Védekeznek, aztán csend", "Elfogadják, de alig történik valami", "Elfogadják, és időt, embert adnak a javításra", "Kifejezetten kérik az ilyen jelzéseket, és örülnek, ha a gond korán kiderül"]),
  { id: "FT1", area: "PO", kind: "text", short: "A leggyakoribb probléma", maxLength: 1000,
    prompt: "Végül: mi okoz leggyakrabban gondot a vizsgált („{process}”) folyamatban?",
    help: "Nem kötelező. Egy-két mondat elég; ha beszélünk, ezzel kezdjük.",
    placeholder: "Pl. hárman nézik át újra ugyanazokat a számokat, mégis egy hetet csúszunk." },
];

export const QUESTION_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));

export const promptFor = (q: Question, industry?: Industry) => (industry && q.promptByIndustry?.[industry]) || q.prompt;
