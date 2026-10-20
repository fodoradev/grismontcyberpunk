import { AREAS, type AreaId, type Finding, type FindingCtx, type NextStepKind, type TextFields } from "../../../lib/scorecard/types";

/**
 * Magyar megállapítások: a jelentés minden mondata innen származik.
 * Közérthető, konkrét teendők, ellenőrizhető készültségi feltételekkel.
 * Szöveg- vagy szabályváltozáskor emeld a CONTENT_VERSION értékét; a tárolt jelentések megőrzik a saját szövegüket.
 */
export const CONTENT_VERSION = "2026-10-20.2";

type When = (c: FindingCtx) => boolean;
const t = (title: string, observed: string, why: string, action: string, done: string): TextFields => ({ title, observed, why, action, done });
const always: When = () => true;
const LOW = 2.75; // ez alatt a terület legfeljebb dokumentált szintű

const quickWin = (id: string, area: AreaId, priority: number, when: When, text: TextFields, extra: Partial<Finding> = {}): Finding =>
  ({ kind: "quickWin", id, area, priority, when, text, ...extra }) as Finding;
const risk = (id: string, area: AreaId | "ALL", priority: number, when: When, text: TextFields): Finding =>
  ({ kind: "risk", id, area, priority, when, text });
const roadmap = (id: string, area: AreaId, window: 30 | 60 | 90, priority: number, when: When, title: string, action: string, done: string): Finding =>
  ({ kind: "roadmap", id, area, window, priority, when, text: t(title, "", "", action, done) });
const note = (area: AreaId, tier: "low" | "mid" | "high", title: string, why: string, action: string): Finding => ({
  kind: "areaNote", id: `note-${area}-${tier}`, area, priority: 0,
  when: c => (tier === "low" ? c.s[area] < 1.5 : tier === "mid" ? c.s[area] >= 1.5 && c.s[area] < LOW : c.s[area] >= LOW),
  text: t(title, "Ezen a területen a leggyengébb válaszod: {weakest}.", why, action, ""),
});
const nextStep = (id: string, step: NextStepKind, when: When, text: TextFields, extra: Partial<Finding> = {}): Finding =>
  ({ kind: "nextStep", id, step, area: "ALL", priority: 0, when, text, ...extra }) as Finding;

export const FINDINGS: Finding[] = [
  // Gyors eredmények – áramlás és veszteségek
  quickWin("qw-fw-approval", "FW", 75, c => c.is("FW2", "approval") && c.score("FW1") <= 2, t(
    "Adj minden jóváhagyásnak értékhatárt és határidőt",
    "Egy egyórás feladat átfutási idejére ezt válaszoltad: „{FW1}”, és szerinted főként jóváhagyásra vár.",
    "Sokszor a jóváhagyások miatt lesz egy egyórás feladatból egyhetes, miközben a jóváhagyók végül szinte mindenre rábólintanak.",
    "Írd össze az ilyen kérésekhez szükséges jóváhagyásokat. Mindegyiknél határozd meg, milyen értékhatár alatt dönthet önállóan a kérelmező, és mi történik, ha 24 órán belül nincs válasz: automatikus jóváhagyás vagy magasabb szintű döntés. Foglald össze egy oldalon, és mutasd meg a csapatnak.",
    "A listán minden jóváhagyásnak van értékhatára és válaszadási határideje, és a csapat ismeri ezeket.")),
  quickWin("qw-fw-intake", "FW", 72, c => c.is("FW2", "info") || (c.score("FW3") <= 1 && c.is("FW2", "rework")), t(
    "Csak hiánytalan információval induljon el a munka",
    "A kérések várakozásának fő okára ezt válaszoltad: „{FW2}”, a javításra visszakerülő munkára pedig ezt: „{FW3}”.",
    "Ha hiányos adatokkal indul a munka, menet közben várni kell, a végén pedig javítani. Mindkettő a napi munka részének tűnik, ezért senki nem számolja.",
    "Írd le azt az 5–8 információt, amely nélkül nem indulhat el egy kérés feldolgozása. Készíts belőlük rövid űrlapot vagy ellenőrzőlistát. A hiányos kérés még a munka megkezdése előtt menjen vissza a küldőhöz.",
    "Az új kéréseket az ellenőrzőlista alapján fogadjátok, és meg tudjátok számolni, hányat küldtetek vissza már az elején, nem a folyamat végén.")),
  quickWin("qw-fw-rework-log", "FW", 70, c => c.score("FW3") <= 1, t(
    "Két hétig rögzíts minden javításra visszakerülő munkát",
    "A javításra visszakerülő munkáról ezt válaszoltad: „{FW3}”.",
    "A javítások véletlenszerűnek tűnnek, amíg nem kezditek számolni őket. A többségük mögött általában két-három ok áll, gyakran már a folyamat legelején.",
    "Két hétig minden visszakerülő munkáról írj egy sort egy közös táblázatba: mi került vissza, ki küldte vissza, mi hiányzott vagy mi volt hibás. Ezután csoportosítsd az eseteket ok szerint.",
    "Megvan a javítások három leggyakoribb oka, mindegyik mellett az esetek számával."),
    { byIndustry: { manufacturing: { action: "Két hétig minden utómunkát, selejtet és javítást ott rögzítsetek, ahol észlelitek: melyik alkatrész vagy rendelés, mi volt a hiba, és honnan érkezett. Munkaállomásonként egy csipeszes táblára tett lap is elég. Ezután csoportosítsd az eseteket ok szerint." } } }),
  quickWin("qw-fw-board", "FW", 66, c => c.score("FW4") <= 1, t(
    "Tedd az összes nyitott feladatot egy közös, látható listára",
    "A feladatátadás jelenlegi módja: „{FW4}”.",
    "Ha a feladatok chaten és folyosói beszélgetésekben adódnak tovább, senki nem látja, mi áll. Így éppen a legrégebbi tételek merülnek feledésbe.",
    "Készíts közös táblát négy oszloppal: Elvégzendő, Folyamatban, Másra vár, Kész. Minden kérés kapjon kártyát felelőssel és dátummal. Hetente kétszer tartsatok mellette egy 10 perces állómegbeszélést.",
    "Bárki egy percen belül meg tudja mondani, melyik a legrégebbi nyitott tétel, és kinél van."),
    { byIndustry: { manufacturing: { action: "Tegyél táblát a munkavégzés helyére négy oszloppal: Elvégzendő, Folyamatban, Másra vár, Kész. Minden rendelés vagy munkafeladat kapjon kártyát felelőssel és határidővel. A műszak elején szánjatok 10 percet az áttekintésére." } } }),
  quickWin("qw-fw-walk", "FW", 20, c => c.s.FW < LOW, t(
    "Kövess végig öt kérést az érkezéstől a lezárásig",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "Az átfutási idő nagy része várakozás. Amíg nem látod, hol áll a munka, minden változtatás csak találgatás.",
    "Válassz öt szokásos kérést. Mindegyiknél jegyezd fel, mikor érkezett, mikor került más kezébe, és mikor készült el. Egy közös táblázatban átadásonként egy sor elég.",
    "Meg tudod mondani, melyik lépésnél állt a legtovább az öt kérés.")),
  quickWin("qw-fw-target", "FW", 20, c => c.s.FW >= LOW, t(
    "Határozz meg átfutásiidő-célt ehhez: {process}",
    "Az egyórás feladatok átfutási idejére ezt válaszoltad: „{FW1}”.",
    "Ha a munka már jól halad, a következő lépés egy cél, amelyet mindenki lát. Enélkül az átfutási idő észrevétlenül újra nőni kezd.",
    "Vedd a leggyakoribb feladattípust ebben a folyamatban: {process}. Mérd meg az utolsó 20 eset átfutási idejét, és állapodjatok meg egy célban, például az esetek 90%-a két napon belül készüljön el. A heti eredményt tedd láthatóvá a csapatnak.",
    "A csapat hetente látja az átfutási időt a célhoz képest, és a következő csapatmegbeszélésen áttekinti az eltéréseket.")),

  // Stabilitás és egységes munkavégzés
  quickWin("qw-ss-backup", "SS", 78, c => c.score("SS3") <= 1, t(
    "Jelölj ki és taníts be helyettest a nélkülözhetetlen kollégának",
    "Ha a kulcsember két hétig távol lenne, ez történne: „{SS3}”.",
    "Ha egyetlen ember hiánya megállít egy folyamatot, az üzleti kockázat, és a növekedésnek is gátat szab.",
    "Még ezen a héten jelöld ki a helyettest. A következő négy hétben hetente egyszer ő végezze el a feladatot a tapasztalt kolléga felügyeletével, és írjon le mindent, amit közben el kellett magyarázni neki.",
    "A helyettes egy teljes hétig önállóan vitte a folyamatot anélkül, hogy felhívta volna a tapasztalt kollégát."),
    { bySize: { "1-10": { action: "Kis csapatban gyakran az alapító a kulcsember. Még ezen a héten jelöld ki a helyettesét, és négy héten át hetente egyszer ő végezze el a feladatot a felügyeleted mellett. Írjatok le mindent, amit el kellett magyaráznod." } } }),
  quickWin("qw-ss-standard", "SS", 72, c => c.score("SS1") <= 1 || c.score("SS2") <= 1, t(
    "Írj egyoldalas munkaleírást arra a három lépésre, ahol a legtöbb a hiba",
    "Az új kollégák betanulásáról ezt válaszoltad: „{SS1}”; ha ketten végzik ugyanazt a feladatot: „{SS2}”.",
    "Ha a módszer csak egy ember fejében van meg, a minőség attól függ, ki dolgozik aznap. Az automatizálás ezt a következetlenséget csak megsokszorozná.",
    "Válaszd ki a három lépést, ahol a legtöbb hiba történik. A feladatot legjobban végző kollégával írjatok lépésenként egy oldalt: szükséges adatok, teendők, kép vagy képernyőkép a helyes eredményről, valamint a két leggyakoribb hiba. Ezután valaki más kizárólag a leírás alapján végezze el a feladatot.",
    "Egy kolléga, aki korábban még nem végezte a feladatot, kizárólag a leírás alapján helyesen teljesíti azt.")),
  quickWin("qw-ss-exceptions", "SS", 64, c => c.score("SS4") <= 1, t(
    "Írd le az öt leggyakoribb kivételt és a kezelésük módját",
    "A kivételek kezelése jelenleg: „{SS4}”.",
    "Ahol a kivételekről mindig eseti alapon döntenek, ott gyűlnek a hibák és a felfelé továbbított ügyek. Később az automatizálást is akadályozzák, mert a szoftvernek egyértelmű szabályokra van szüksége.",
    "Kérdezd meg azokat a kollégákat, akikhez az elakadt ügyek kerülnek, melyik öt kivétellel találkoznak a leggyakrabban. Mindegyiknél írd le, hogyan ismerhető fel, mi a teendő, és ki dönt bizonytalan esetben.",
    "Az öt kivétel kezelése le van írva, és egy hónap múlva érezhetően kevesebb ügy kerül a tapasztalt kollégához.")),
  quickWin("qw-ss-changelog", "SS", 55, c => c.score("SS5") <= 1, t(
    "Vezess rövid változásnaplót a munkavégzés módjáról",
    "A folyamatváltozások így jutnak el az érintettekhez: „{SS5}”.",
    "Ha a változásokat csak szóban adjátok tovább, a csapat fele még hetekig a régi módon dolgozik, a hibák pedig egyéni tévedésnek tűnnek.",
    "Hozz létre egy közös „Így dolgozunk: változások” oldalt. Minden folyamatváltozás kapjon egy dátumozott sort: mi változott, miért, és hol érhető el a frissített leírás. Az oldal linkjét tedd oda, ahová a csapat amúgy is gyakran ránéz.",
    "Az utolsó három folyamatváltozás szerepel az oldalon, és a kollégák előbb ott néznek utána, mielőtt kérdeznének.")),
  quickWin("qw-ss-watch-twice", "SS", 20, c => c.s.SS < LOW, t(
    "Nézd meg, hogyan végzi ugyanazt a feladatot két különböző ember",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "Az íróasztal mögül nem látszik, mennyire másképp dolgoznak az emberek. Az összehasonlításból kiderül, melyik módszer működik jobban, és ebből lehet az első közös munkaleírás.",
    "Válaszd ki a legkritikusabb feladatot ebben a folyamatban: {process}. Figyeld meg két kolléga munkáját, és jegyezz fel minden eltérést a lépésekben, eszközökben és ellenőrzésekben. Állapodjatok meg a legjobb módszerben, és írjátok le egy oldalon.",
    "Egy oldal rögzíti az elfogadott módszert, és mindkét kolléga legalább egyszer ennek megfelelően végezte el a feladatot.")),
  quickWin("qw-ss-review-dates", "SS", 20, c => c.s.SS >= LOW, t(
    "Minden munkaleírásnak legyen felelőse és felülvizsgálati dátuma",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "A munkaleírások észrevétlenül elavulnak. Egy éven belül több is már nem azt írja le, ami ténylegesen történik, és az emberek a többiben sem bíznak többé.",
    "Minden munkaleíráshoz jelölj ki felelőst és hat hónapon belüli felülvizsgálati dátumot. A felülvizsgálatkor a felelős nézze végig egyszer a feladat elvégzését, és frissítse a leírást.",
    "Minden munkaleíráson szerepel felelős és még le nem járt felülvizsgálati dátum.")),

  // Adatok és mérés
  quickWin("qw-dm-count", "DM", 76, c => c.score("DM1") <= 1, t(
    "Kezdj el kézzel mérni egyetlen mutatót",
    "A hibák vagy javítások arányáról ezt válaszoltad: „{DM1}”.",
    "Előtte és utána mérés nélkül nem tudod megmondani, segített-e egy változtatás. Kezdetnek egy strigulázó lap is elég; a rendszer ráér később.",
    "Válassz egy mutatót ehhez a folyamathoz: {process}. Lehet a hibák, javítások vagy késedelmes teljesítések száma. Írd le pontosan, mit számoltok bele, hogy mindenki ugyanúgy mérjen. Négy héten át naponta rögzítsétek.",
    "Megvan négy hét napi adata és egy írásos definíció, így ismert a kiinduló állapot.")),
  quickWin("qw-dm-definitions", "DM", 68, c => c.score("DM3") <= 1, t(
    "Írd le pontosan az öt legtöbbet vitatott mutató definícióját",
    "Ha ketten kérik le ugyanazt a számot, ez történik: „{DM3}”.",
    "Ha mindenki más számot kap, a megbeszélés arról szól, kinek van igaza, és nem arról, mit kell tenni.",
    "Írd össze az öt legtöbb vitát okozó mutatót. Mindegyiknél írd le a pontos definíciót, a forrásrendszert vagy fájlt, a használt szűrőket és a felelőst. A leírást tedd a jelentés mellé.",
    "Amikor legközelebb valaki megkérdőjelez egy számot, a választ megtalálja a definíciókat tartalmazó oldalon.")),
  quickWin("qw-dm-report-map", "DM", 62, c => c.score("DM2") <= 1, t(
    "Térképezd fel a fő vezetői jelentés minden számának forrását",
    "A vezetői jelentések számai innen származnak: „{DM2}”.",
    "A kézzel összerakott jelentések minden alkalommal órákat visznek el, és hibák bújhatnak meg bennük. A feltérképezés az automatizálás első lépése, és általában olyan számok is előkerülnek, amelyeket senki nem használ.",
    "Vedd elő a fő vezetői jelentést. Minden számnál jegyezd fel, honnan jön, ki dolgozik vele, és mennyi idő előállítani. Jelöld meg azokat, amelyek alapján az elmúlt három hónapban senki nem lépett semmit, és hagyjátok el őket.",
    "Elkészült a jelentés egyoldalas forrástérképe, és legalább egy mutató előállítását elhagytátok vagy automatizáltátok.")),
  quickWin("qw-dm-baseline", "DM", 58, c => c.score("DM4") <= 1, t(
    "A következő javítás előtt rögzítsd a kiinduló értéket",
    "A folyamatproblémákról szóló döntések alapja: „{DM4}”.",
    "Kiinduló érték nélkül bármelyik javításra rá lehet mondani, hogy „sikeres”. Így fordul elő, hogy egy cég évről évre ugyanazt a problémát oldja meg.",
    "A következő folyamatváltoztatás előtt írj le egy sort: mi a probléma, mennyi a mutató mai értéke, és milyen értéket vársz a változtatás után. Négy héttel később mérd meg újra.",
    "A következő változtatás előtti és utáni érték le van írva, és a négyhetes ellenőrzés is megvolt.")),
  quickWin("qw-dm-fallback-low", "DM", 20, c => c.s.DM < LOW, t(
    "Válassz egy mutatót, és tedd megbízhatóvá",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "Sok cégnél rengeteg szám készül, de egyikben sem bíznak igazán. Egyetlen megbízható mutató többet ér egy egész kimutatásnál, amelyet senki nem hisz el.",
    "Válaszd ki azt az egy mutatót, amely a legjobban jellemzi ennek a folyamatnak a működését: {process}. Írd le a meghatározását és a forrását, majd négy héten át ugyanaz a személy, ugyanazzal a módszerrel állítsa elő hetente.",
    "Ugyanaz a személy négy egymást követő héten, azonos módon állította elő a mutatót, és senki nem vitatta az értékét.")),
  quickWin("qw-dm-trend", "DM", 20, c => c.s.DM >= LOW, t(
    "A trendeket nézd az egyedi számok helyett",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "Egyetlen adat alapján könnyű túlreagálni a természetes ingadozást. A trendből látszik, történt-e valódi változás.",
    "Ábrázold a fő folyamatmutató utolsó 12 heti értékét egyszerű vonaldiagramon. Állapodjatok meg abban, hogy hat egymást követő, azonos irányba változó érték esetén avatkoztok be, nem egyetlen rossz hét miatt.",
    "A heti áttekintésen a diagramot nézitek, és a legutóbbi döntésetek a trendre épült.")),

  // Automatizálási lehetőségek
  quickWin("qw-ap-postmortem", "AP", 66, c => c.score("AP5") === 0, t(
    "Új eszköz vásárlása előtt derítsd ki, miért hagytátok el az előzőt",
    "A legutóbb bevezetett automatizálás vagy eszköz sorsáról ezt válaszoltad: „{AP5}”.",
    "Az eszközöket többnyire nem technikai okból hagyják el: nincs gazdájuk, vagy nem illenek a tényleges munkához. Ha ez nem derül ki, a következő eszköz is ugyanígy járhat.",
    "Kérdezz meg három embert, akinek használnia kellett volna: mit nehezített meg az eszköz? Írd le a fő okokat, mielőtt újat választasz.",
    "Az okok le vannak írva, és a következő eszköz kiválasztásakor mindegyikre van válasz.")),
  quickWin("qw-ap-rules", "AP", 64, c => c.score("AP3") <= 1 && c.s.opportunity >= 2, t(
    "Írd le a leggyakrabban ismétlődő feladat ha–akkor szabályait: {process}",
    "A lépések szabályokba foglalhatóságára ezt válaszoltad: „{AP3}”.",
    "A szoftver csak leírható szabályokat tud követni. A szabályok megírásakor az is kiderül, hol mérlegel most mindenki a maga feje szerint, és hol kell előbb közös szempontban megegyezni.",
    "Vedd a legtöbbször ismétlődő feladatot ebben a folyamatban: {process}. Friss, valós esetek alapján írd le számozott lépésekben, minden döntésnél ha–akkor szabállyal. Jelölj meg minden pontot, ahol a válasz az, hogy „attól függ”.",
    "A szabályok papíron helyesen kezelnek tíz közelmúltbeli esetet, és minden „attól függ” kérdésnek megvan a döntési felelőse.")),
  quickWin("qw-ap-handover", "AP", 60, c => c.score("AP5") === 2, t(
    "Írd le, és add át másnak is a meglévő automatizálás üzemeltetését",
    "A legutóbbi automatizálásodról ezt válaszoltad: „{AP5}”.",
    "Ha csak egy ember tudja megjavítani az automatizálást, minden rajta múlik. Ráadásul a hibák gyakran észrevétlenek maradnak.",
    "Az automatizálás készítője írja le egy oldalon, mit csinál, hol fut, mitől romolhat el, és hogyan indítható újra. Ezután egy másik kolléga kizárólag a leírás alapján egyszer indítsa újra.",
    "A készítőn kívül más is újraindította vagy megjavította az automatizálást a leírás alapján.")),
  quickWin("qw-ap-exports", "AP", 52, c => c.score("AP4") <= 1 && c.s.opportunity >= 2, t(
    "Nézd meg, melyik rendszerből lehet kiszedni az adatokat",
    "Arra, hogy ki lehet-e szedni az adatokat a rendszerekből, ezt válaszoltad: „{AP4}”.",
    "Az automatizáláshoz adatokat kell betenni a rendszerekbe és kivenni belőlük. Ha ezt előre megnézed, nem veszel olyan eszközt, amely nem köthető a meglévő rendszereidhez.",
    "Írd össze a legtöbb kézi munkát igénylő feladatokhoz használt rendszereket. Mindegyiknél ellenőrizd a gyártói dokumentációban vagy az ügyfélszolgálatnál az exportformátumokat, az API-hozzáférést, és azt, hogy a jelenlegi előfizetés tartalmazza-e ezeket.",
    "A lista minden rendszerénél szerepel, hogy elérhető-e export és API, a válasz forrásával együtt.")),
  quickWin("qw-ap-inventory", "AP", 30, c => c.s.opportunity >= 2, t(
    "Írd össze, milyen adatmásolási feladatok vannak, és hetente mennyi időt visznek el",
    "Az adatok ismételt kézi bevitelére fordított heti órák becslése: „{AP1}”; a rögzített szabályokat követő ismétlődő feladatokról ezt válaszoltad: „{AP2}”.",
    "Nem minden kézi feladat automatizálása térül meg. Ha a listán az időigény és a hibák gyakorisága is szerepel, látszik, melyik két-három feladattal érdemes kezdeni.",
    "Kérj meg minden csapattagot, hogy írja össze azokat az ismétlődő feladatait, amelyekben adatot visz át egyik rendszerből a másikba, a heti óraszámmal és azzal együtt, milyen gyakran csúszik be hiba. Egyesítsd a listákat, és rangsorold a tételeket előbb időigény, majd hibagyakoriság szerint.",
    "Elkészült a rangsorolt lista, és az első helyen álló feladatnak kijelölt felelőse van.")),
  quickWin("qw-ap-not-bottleneck", "AP", 15, c => c.s.opportunity < 2, t(
    "Az automatizálás még várhat: most más korlátozza a működést",
    "Az adatok ismételt kézi bevitelére fordított heti órák becslése: „{AP1}”; a rögzített szabályokat követő ismétlődő feladatokról ezt válaszoltad: „{AP2}”.",
    "Ha kevés a szabályalapú kézi munka, az automatizálás lassan térülne meg. Most valószínűleg többet hozna, ha a munka haladására, a minőségre vagy a felelősségekre figyelnétek.",
    "Állapodjatok meg egy egyszerű szabályban: minden automatizálási javaslat tartalmazza a várható heti óramegtakarítást. Ami hetente öt óránál kevesebbet spórol, azt tegyétek félre, és a keretet fordítsátok a riport leggyengébb területére.",
    "A szabály írásban rögzítve van, és a következő automatizálási javaslatban szerepel a heti óramegtakarítás.")),

  // AI-felkészültség
  quickWin("qw-ai-rule", "AI", 82, c => c.score("AI1") <= 1, t(
    "Még ebben a hónapban írj egyoldalas AI-adatkezelési szabályt",
    "Az AI-eszközök adatkezelési szabályairól ezt válaszoltad: „{AI1}”. Az AI jelenlegi használata: „{AI2}”.",
    "Az emberek szabály nélkül is használják az AI-t, így ügyfél- és céges adatok kerülhetnek személyes, ingyenes fiókokba. Egy világos szabállyal a használat biztonságosabb és átláthatóbb lesz.",
    "Írd le egy oldalon, mely eszközök engedélyezettek, milyen adatot tilos megadni nekik (ügyfelek személyes adatai, szerződések, pénzügyi adatok, jelszavak), mi használható (nyilvános információ, saját szövegvázlat), és kihez lehet kérdéssel fordulni. Egy közös megbeszélésen mutasd be mindenkinek.",
    "A szabály elérhető, mindenki megismerte, és a kollégák tudják, melyik eszközt használhatják.")),
  quickWin("qw-ai-inventory", "AI", 70, c => c.score("AI2") === 0, t(
    "Kérdezd meg a kollégákat, mire használnak már AI-t",
    "Az AI jelenlegi használata: „{AI2}”.",
    "A rejtett használatból egyszerre derül ki, mire jó tényleg az AI, és hol a legnagyobb az adatkockázat. Mindkettőt érdemes a felszínre hozni.",
    "Készíts névtelen, ötperces felmérést: mely AI-eszközöket használják munkára, milyen feladatokhoz, és milyen adatokat adnak meg nekik? Tedd egyértelművé, hogy nem bűnbakot kerestek.",
    "Elkészült a tényleges használat listája három kategóriában: engedhető, céges fiókkal engedhető, leállítandó.")),
  quickWin("qw-ai-problem", "AI", 62, c => c.score("AI5") <= 1 && c.s.foundation >= 1.5, t(
    "Válassz egy AI-felhasználási esetet, és mérd meg a kiinduló állapotát",
    "Az AI-val megoldandó konkrét problémáról ezt válaszoltad: „{AI5}”.",
    "A „kellene valamit kezdenünk az AI-val” könnyen egy haszontalan eszközvásárlásban végződik. Egy konkrét feladat és egy mérőszám alapján el lehet dönteni, megéri-e belevágni.",
    "Válassz egy gyakori, sok szöveggel járó, kis kockázatú feladatot, például válaszvázlatok készítését gyakori kérdésekre vagy dokumentumok összefoglalását. Mérd meg a jelenlegi időigényét tíz valós eseten.",
    "Megvan a kiválasztott feladat, hogy most esetenként mennyi időt visz el, és a célérték.")),
  quickWin("qw-ai-test-set", "AI", 60, c => c.score("AI4") <= 1 && c.score("AI5") >= 2, t(
    "Gyűjts össze 20 korábbi esetet a helyes válasszal együtt",
    "Egy AI által készített válasz ellenőrzéséről ezt válaszoltad: „{AI4}”.",
    "Ha nincs módod ellenőrizni, vagy vakon megbízol az AI-ban, vagy mindent kézzel nézel át, és akkor elveszik az időnyereség.",
    "A kiválasztott AI-felhasználáshoz gyűjts össze 20 valós, korábbi példát az általad helyesnek elfogadott válasszal együtt. Írd le azt is, mitől számít egy válasz hibásnak.",
    "Megvan 20 eset és a helyes válasz írásos leírása, amelyekkel bármelyik AI-eszköz kipróbálható.")),
  quickWin("qw-ai-knowledge", "AI", 56, c => c.score("AI3") <= 1, t(
    "Írd le a 20 leggyakoribb kérdésre adott helyes választ",
    "A tipikus kérdések megválaszolásához szükséges tudás helye: „{AI3}”.",
    "Ahhoz, hogy az AI használni tudja a céges tudást, annak leírva kell lennie. Ugyanez a leírás már most, AI nélkül is segít az új kollégáknak.",
    "Gyűjtsd össze az ügyfelek vagy kollégák 20 leggyakoribb kérdését. Mindegyikhez írd le az aktuális, helyes választ egy közös dokumentumba, és jelölj ki hozzá felelőst.",
    "A 20 válasz egy helyen elérhető, és az új kollégák itt néznek utána, ahelyett hogy mindenkit körbekérdeznének.")),
  quickWin("qw-ai-trial", "AI", 20, c => c.s.AI < LOW && c.s.foundation >= 2, t(
    "Próbáld ki az AI-t négy hétig egy kis kockázatú feladaton",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "A folyamataid alapjai elég stabilak egy átgondolt AI-próbához. Egy rövid, mért próba többet mond bármelyik termékbemutatónál.",
    "Válassz egy gyakori, kis kockázatú, sok szöveggel járó feladatot. Négy hétig használjatok hozzá engedélyezett eszközt céges fiókkal. Mérjétek meg, mennyi idő egy eset, és hány hibát találtok, a bevezetés előtt és után is.",
    "Megvannak az előtte–utána idő- és hibaadatok, és eldőlt, folytatjátok-e vagy leállítjátok.")),
  quickWin("qw-ai-measure", "AI", 20, c => c.s.AI >= LOW, t(
    "Vesd össze az AI használatát a bevezetés előtti állapottal",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "Mérés nélkül az AI-t vagy az első költségcsökkentéskor kivezetik, vagy még jóval azután is fizetik, hogy már nem éri meg.",
    "Minden működő AI-felhasználásnál négy héten át mért adatok alapján hasonlítsd össze az esetenkénti időigényt és a hibaarányt az AI előtti kiinduló értékekkel.",
    "Minden felhasználási esethez van előtte–utána mérés és döntés: marad, módosul vagy leáll.")),

  // Emberek és felelősségek
  quickWin("qw-po-owner", "PO", 74, c => c.score("PO2") <= 1, t(
    "Jelölj ki egyetlen felelőst ehhez: {process}",
    "A teljes folyamat felelőse ennél: {process}. A válaszod: „{PO2}”.",
    "Ha mindenki csak a saját részéért felel, az átadásoknak nincs gazdájuk. Pedig a legtöbb késés és hiba éppen ott történik.",
    "Jelölj ki egy embert, aki a kéréstől a teljesítésig felel a folyamatért. Rendelj hozzá egy mutatót, például az átfutási időt, és hatalmazd fel arra, hogy havonta egy 30 perces áttekintésre összehívja az érintett csapatokat.",
    "A felelős neve és a mutató le van írva, és az első havi áttekintés is megvolt."),
    { bySize: { "1-10": { action: "Ekkora csapatban valószínűleg te vagy a folyamat felelőse. Írd le azt az egy mutatót, amelyet havonta ellenőrzöl ennél a folyamatnál, és azt is, ki helyettesít, ha távol vagy." } } }),
  quickWin("qw-po-problems", "PO", 66, c => c.score("PO3") <= 1, t(
    "Legyen hol jelezni a problémákat, és mindig jöjjön rá válasz",
    "Ha valaki problémát vesz észre, ez történik: „{PO3}”.",
    "Ha a jelzés után semmi nem változik, az emberek idővel nem szólnak, hanem megkerülik a problémát, és így rejtve marad, mennyibe kerül.",
    "Hozz létre egyszerű problématáblát a falon vagy közös online felületen, ahová bárki írhat. Hetente 15 percben nézzétek át: válasszatok egy problémát, jelöljetek ki felelőst, és jelezzetek vissza a bejelentőnek arról, mi történt.",
    "Az elmúlt hónap minden jelzett problémájának ismert az állapota, és minden bejelentő kapott visszajelzést.")),
  quickWin("qw-po-stick", "PO", 60, c => c.score("PO1") <= 1, t(
    "Nézd meg, működnek-e még a tavalyi fejlesztések",
    "A legutóbbi fejlesztés helyzete három hónap elteltével: „{PO1}”.",
    "Ha senki nem nézi meg, a fejlesztések eredménye elvész. Ugyanazt a problémát kétszer megoldani többe kerül, mint egyszer utánanézni.",
    "Írj össze három fejlesztést az elmúlt évből, és nézd meg a helyszínen, hogy még mindig az új módon dolgoznak-e. Ahol visszaálltak a régire, írd le, miért.",
    "Tudod, melyik fejlesztés maradt fenn, és a többi miért nem.")),
  quickWin("qw-po-time", "PO", 56, c => c.score("PO4") <= 1, t(
    "Különíts el heti két órát egy fejlesztésre",
    "A fejlesztési munkára fordítható időről ezt válaszoltad: „{PO4}”.",
    "Ha nincs rá külön idő, a fejlesztéssel csak akkor foglalkoztok, amikor már ég a ház, így mindig csak a leghangosabb problémák oldódnak meg.",
    "Válassz ki két embert. Hat héten át foglalj le nekik heti két órát arra, hogy a riport egyik problémáját megoldják. A hatodik héten értékeljétek az eredményt.",
    "A hat hétre lefoglalt időt tényleg fejlesztésre használtátok, és az eredményt számokkal is értékeltétek.")),
  quickWin("qw-po-review", "PO", 20, c => c.s.PO < LOW, t(
    "Vezess be havi 20 perces folyamatáttekintést",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "Egy fejlesztés akkor marad meg, ha valaki rendszeresen ránéz. Egy rövid, rendszeres áttekintés többet ér az alkalmi nagy nekifutásoknál.",
    "Havonta egyszer ennek a folyamatnak a felelőse mutassa be a fő mutatót, a hónap legnagyobb problémáját és a megtett intézkedést: {process}. Mindig ugyanazon a napon, ugyanabban az időpontban, 20 percben.",
    "Három egymás utáni áttekintést megtartottatok, egyet sem mondtatok le.")),
  quickWin("qw-po-teach", "PO", 20, c => c.s.PO >= LOW, t(
    "A fejlesztésben jártas kollégák segítsenek egy másik csapatnak",
    "Ezen a területen a leggyengébb válaszod: {weakest}.",
    "A fejlesztési szokásaitok működnek. Átadni őket olcsóbb, mint egy másik csapatban a nulláról újra felépíteni.",
    "Egy kolléga, aki jól viszi a fejlesztéseket, segítsen egy olyan csapatnak, ahol ez még nem bevett gyakorlat. Hat hét alatt közösen valósítsanak meg egy kisebb fejlesztést.",
    "A másik csapat lezárt egy fejlesztést, amelynek az eredményét megmérte.")),

  // Kockázatok
  risk("risk-shadow-ai", "AI", 95, c => c.score("AI1") <= 1 && (c.score("AI2") === 0 || c.score("AI2") >= 2), t(
    "Céges adatok személyes AI-fiókokban",
    "Az AI-eszközök adatkezelési szabályairól ezt válaszoltad: „{AI1}”. Az AI jelenlegi használata: „{AI2}”.",
    "Az ingyenes, magánfelhasználóknak szóló AI-eszközök megőrizhetik és felhasználhatják a bemásolt tartalmat, és erről nálatok semmi nem marad nyilvántartva. Egyetlen bemásolt ügyféllistából is lehet adatvédelmi incidens.",
    "Még ezen a héten mondd el a kollégáknak, melyik eszközt használhatják, és milyen adatokat tilos megadniuk. Ebben a hónapban biztosíts engedélyezett eszközt céges fiókokkal.",
    "Megvan az engedélyezett eszköz, mindenki ismeri a szabályt, és már senki nem személyes fiókkal dolgozik.")),
  risk("risk-automate-chaos", "ALL", 90, c => c.s.opportunity >= 2.5 && c.s.foundation < 2, t(
    "Még nem stabil folyamat automatizálása",
    "Sok a szabályalapú kézi munka (lehetőség: {score.opportunity} a 4-ből), de az alapul szolgáló folyamat még nem stabil (stabilitás: {score.SS}, adatok: {score.DM}).",
    "Az automatizálás a folyamatot a hibáival és kerülőútjaival együtt másolja le. Az eredmény gyakran gépi sebességgel gyártott hibák, és egy eszköz, amelyben három hónap után már senki nem bízik.",
    "Mielőtt automatizálásra költesz, stabilizáld a kiválasztott folyamatot: legyen hozzá egységes munkaleírás, és mérjétek a hibaarányt négy hétig. Csak akkor automatizálj, ha a hibaarány már nem ugrál.",
    "A kiválasztott folyamatnak van munkaleírása és négy hétnyi stabil hibaadata, mielőtt pénzt költötök az automatizálására.")),
  risk("risk-key-person", "SS", 85, c => c.score("SS3") <= 1, t(
    "Egy ember kiesik, és leáll a folyamat",
    "Ha a kulcsember két hétig távol lenne, ez történne: „{SS3}”.",
    "Egy betegségből, felmondásból vagy szabadságból leállás lesz. A növekedést is fékezi: a folyamat nem bír el több munkát, mint amennyi ennek az egy embernek az idejébe belefér.",
    "Most jelölj ki helyettest, aki egy hónapon át hetente egyszer felügyelet mellett viszi a folyamatot. Írjatok le mindent, amit a tapasztalt kollégának el kellett magyaráznia.",
    "A helyettes egy teljes hétig önállóan vitte a folyamatot.")),
  risk("risk-messenger", "PO", 84, c => c.score("PO5") <= 1, t(
    "Későn érkeznek a rossz hírek",
    "Ha valaki megmutatja, hogy egy folyamat rosszabbul működik a vártnál, ez történik: „{PO5}”.",
    "Ha kockázatos szólni egy problémáról, a gondok csak akkor jönnek elő, amikor már sokba kerülnek. A fejlesztési és AI-projektekben is azt fogják mondani a vezetésnek, amit hallani szeretne.",
    "A vezetés nyilvánosan köszönje meg a következő folyamatprobléma jelzését, és két héten belül tegyen látható intézkedést.",
    "A következő probléma jelzését köszönet és két héten belüli látható intézkedés követte.")),
  risk("risk-ai-unchecked", "AI", 82, c => c.score("AI2") >= 3 && c.score("AI4") <= 1, t(
    "AI-eredmények, amelyeket senki nem ellenőriz",
    "Az AI jelenlegi használata: „{AI2}”. Az eredmény ellenőrzéséről ezt válaszoltad: „{AI4}”.",
    "Az AI-eszközök néha teljes magabiztossággal adnak rossz választ. Ha nincs meghatározva, mi számít helyes eredménynek, a hibák az ügyfelekhez jutnak, mielőtt bárki észrevenné őket.",
    "Minden felhasználási esethez írd le a helyes eredmény feltételeit. Hetente ellenőrizz tíz eredményt, és rögzítsd a talált hibákat.",
    "Minden AI-felhasználási esetnek vannak írásos ellenőrzési feltételei és heti hibaadatai.")),
  risk("risk-blind", "DM", 80, c => c.score("DM1") <= 1 && c.score("DM4") <= 1, t(
    "Döntések kiinduló mérés nélkül",
    "A hibaarányról ezt válaszoltad: „{DM1}”. A döntések alapja: „{DM4}”.",
    "Kiinduló mérés nélkül nem tudod megkülönböztetni a működő javítást attól, amelyik nem vált be. Így a pénz a leghangosabb problémára megy el, nem feltétlenül a legnagyobbra.",
    "Kezdj el most mérni egy mutatót, és minden finanszírozott változtatáshoz kérj előtte–utána mérési adatot.",
    "A következő finanszírozott változtatás kiinduló értéke írásban rögzítve van.")),
  risk("risk-repeat-failure", "AP", 78, c => c.score("AP5") === 0 && c.s.opportunity >= 2, t(
    "A következő eszköz is az előző sorsára juthat",
    "A legutóbbi eszköz sorsáról ezt válaszoltad: „{AP5}”, miközben továbbra is sok a kézi munka (heti óraszám: „{AP1}”).",
    "Az automatizálásra valóban szükség van, de az előző próbálkozás nem vált be. Ha nem tudod, miért, a következő vásárlás is valószínűleg ugyanígy végződik.",
    "Eszközválasztás előtt írd le, miért hagytátok el az előzőt. A következő bevezetés előfeltétele legyen a kijelölt felelős és az egységes munkaleírás.",
    "A következő eszközválasztási döntés megnevezi a felelőst, és hivatkozik a korábbi kudarc leírt okaira.")),
  risk("risk-rework", "FW", 74, c => c.score("FW3") <= 1, t(
    "A javítások észrevétlenül felemésztik a kapacitást",
    "A javításra visszakerülő munkáról ezt válaszoltad: „{FW3}”.",
    "Ha folyton javítani kell, a munka jelentős részéért kétszer fizetsz. Ez rejtve marad, mert a napi munka részének látszik, ezért gyakran éppen ezt próbálják először automatizálni.",
    "Két hétig számold a javításra visszakerülő munkákat, majd a folyamat elején szüntesd meg a leggyakoribb okot.",
    "A következő négy hét mérése szerint csökkent a leggyakoribb okból szükségessé váló javítások száma.")),
  // A legalacsonyabb pontszámú terület kockázata, annak szintjétől függetlenül.
  ...AREAS.map(area => risk(`risk-lowest-${area}`, area, 10, c => c.lowestArea === area, {
    FW: t("A munka többet áll, mint amennyit halad", "A leggyengébb területen ezt a választ értékeltük a legalacsonyabbra: {weakest}.", "A várakozás a terheléssel együtt észrevétlenül nő. Amikor több a munka, az átfutási idő megugrik, és ezt az ügyfelek hamarabb észreveszik, mint ti.", "Kövess végig öt kérést, keresd meg a leghosszabb várakozást, és először azt szüntesd meg.", "A következő öt kérés mérése szerint rövidült a feltárt leghosszabb várakozás."),
    SS: t("Az eredmény attól függ, ki végezte a munkát", "A leggyengébb területen ezt a választ értékeltük a legalacsonyabbra: {weakest}.", "Ha mindenki másképp dolgozik, a minőség is ingadozik, és az automatizálás ezt az ingadozást viszi tovább.", "Írj egyoldalas munkaleírást a legtöbb hibát okozó lépéshez, és próbáltasd ki valakivel, aki még nem végezte.", "A feladatban járatlan kolléga kizárólag a leírás alapján helyesen végzi el a lépést."),
    DM: t("Számok, amelyekben senki nem bízik teljesen", "A leggyengébb területen ezt a választ értékeltük a legalacsonyabbra: {weakest}.", "Megbízható számok nélkül a döntések véleményekre épülnek, a fejlesztési és AI-projekteknek pedig nincs mérhető kiinduló állapotuk.", "Válassz egy mutatót, határozd meg írásban, és négy héten át ugyanazzal a módszerrel állítsd elő.", "Megvan négy hét adata ugyanarról a mutatóról, azonos módon előállítva, és senki nem vitatja."),
    AP: t("Automatizálás, amely nem marad működőképes", "A leggyengébb területen ezt a választ értékeltük a legalacsonyabbra: {weakest}.", "Alacsony felkészültség mellett az automatizálás elakad a kivételeken, egyetlen embertől függ, vagy nem fér hozzá a szükséges adatokhoz.", "Vásárlás előtt rendezd az alapokat: írásos szabályok a kiválasztott feladathoz, kijelölt felelős és igazolt adathozzáférés.", "A kiválasztott feladatnak vannak szabályai, felelőse és igazolt adathozzáférése."),
    AI: t("AI-bevezetés hiányzó alapokkal", "A leggyengébb területen ezt a választ értékeltük a legalacsonyabbra: {weakest}.", "Szabályok, leírt tudás és ellenőrzés nélkül az AI-ból könnyen adatszivárgás vagy újracsinálandó munka lesz.", "Tedd közzé az AI-adatkezelési szabályt, és írd le az első felhasználási esethez szükséges tudást.", "A szabály elérhető, és egy felhasználási esethez a szükséges tudás írásban rendelkezésre áll."),
    PO: t("Fejlesztések, amelyek nem maradnak fenn", "A leggyengébb területen ezt a választ értékeltük a legalacsonyabbra: {weakest}.", "Felelősök és elkülönített idő nélkül a fejlesztések eredménye néhány hónap alatt elvész, és a következő projekt ugyanonnan indul.", "Jelölj ki egy felelőst a kulcsfolyamatnak, és havonta röviden tekintsétek át az egyetlen fő mutatóját.", "Három egymást követő havi áttekintést megtartottatok."),
  }[area])),

  // Ütemterv – 1–30. nap: a munka feltérképezése, az alapok rendezése.
  roadmap("rm30-walk", "FW", 30, 40, always, "Járd végig a folyamatot", "A munkát végzőkkel együtt kövess végig egy kérést az elejétől a végéig. Jelöljetek be minden várakozást és minden visszalépést javítás miatt.", "Egyoldalas folyamattérkép, rajta bekarikázva a három leghosszabb várakozás."),
  roadmap("rm30-baseline", "DM", 30, 70, c => c.s.DM < LOW, "Mérd meg a kiinduló állapotot", "Írásos meghatározás alapján naponta, kézzel rögzítsétek az átfutási időt és a hibákat ennél a folyamatnál: {process}.", "A 30. napra négy hét mérési adata áll rendelkezésre."),
  roadmap("rm30-owner", "PO", 30, 65, c => c.score("PO2") <= 2, "Jelöld ki a folyamat felelősét", "Egyetlen ember feleljen a kulcsfolyamatért az elejétől a végéig, egy fő mutatóval.", "A felelős neve és a mutató le van írva, és minden érintett megkapta."),
  roadmap("rm30-ai-rule", "AI", 30, 75, c => c.score("AI1") <= 2, "Tedd közzé az AI-adatkezelési szabályt", "Egy oldalon rögzítsd az engedélyezett eszközöket és a tiltott adatokat, és ismertesd mindenkivel.", "A szabály elérhető, az engedélyezett eszközt kiválasztottátok."),
  roadmap("rm30-board", "FW", 30, 55, c => c.score("FW4") <= 2, "Tedd láthatóvá a nyitott munkákat", "Minden nyitott munka egy közös táblára kerüljön, amelyet hetente kétszer 10 percben áttekintetek.", "A tábla naprakész, és ismert a legrégebbi nyitott tétel."),
  roadmap("rm30-backup", "SS", 30, 72, c => c.score("SS3") <= 1, "Taníts be helyettest", "A helyettes hetente, felügyelet mellett vigye ezt a folyamatot: {process}.", "Az első felügyelt alkalom megtörtént, a jegyzetek elkészültek."),
  roadmap("rm30-intake", "FW", 30, 50, c => c.score("FW3") <= 2, "Határozd meg, mi kell a munka elindításához", "Rögzítsd, mit kell tartalmaznia egy kérésnek a munka megkezdése előtt, és a hiányos kéréseket küldjétek vissza.", "Minden új kérésnél használjátok az ellenőrzőlistát."),
  roadmap("rm30-rhythm", "PO", 30, 25, always, "Tedd rendszeressé az áttekintést", "A következő három hónapra foglalj havonta 20 percet arra, hogy a folyamat felelősével átnézzétek a fő mutatót.", "Három időpont szerepel a naptárban, az első alkalmat megtartottátok."),
  // 31–60. nap: egységesítés és a veszteségek csökkentése.
  roadmap("rm60-waste", "FW", 60, 40, always, "Szüntesd meg a legnagyobb várakozást", "A feltérképezéskor talált leghosszabb várakozást szüntesd meg: jóváhagyási értékhatárral, a sorban álló tételek számának korlátozásával vagy egy felesleges átadás kihagyásával.", "A következő tíz kérés átfutási ideje rövidebb a kiinduló értéknél."),
  roadmap("rm60-standards", "SS", 60, 65, c => c.s.SS < 3.5, "Írd meg az egységes munkaleírásokat", "Készüljön egyoldalas leírás arra a három lépésre, ahol a legtöbb a hiba. Mindegyiket próbálja ki egy kolléga, aki még nem csinálta a feladatot.", "Három kipróbált munkaleírás közös helyen elérhető."),
  roadmap("rm60-exceptions", "SS", 60, 55, c => c.score("SS4") <= 2, "Írd le a kivételek kezelési szabályait", "Rögzítsd az öt leggyakoribb kivétel kezelését és azt, ki dönt bizonytalan esetben.", "Kevesebb ügyet kell a tapasztalt kollégához továbbítani."),
  roadmap("rm60-definitions", "DM", 60, 60, c => c.score("DM3") <= 2, "Egyezzetek meg, mit jelentenek a mutatók", "Írjátok le az öt legtöbbet vitatott mutató definícióját és forrását.", "Mindenki ugyanazt a definíciós oldalt használja."),
  roadmap("rm60-report", "DM", 60, 50, c => c.score("DM2") <= 2, "Egyszerűsítsd a vezetői jelentést", "Nézd meg minden mutatónál, honnan jön, és mennyi idő előállítani. A nem használtakat hagyd el, a legtöbb munkával járót pedig automatizáld.", "Mérhetően kevesebb idő megy el egy jelentés elkészítésére."),
  roadmap("rm60-problems", "PO", 60, 52, c => c.score("PO3") <= 2, "Indíts közös problématáblát", "Legyen egy hely, ahol jelezni lehet a problémákat; hetente nézzétek át, és minden bejelentő kapjon visszajelzést.", "Minden jelzett problémának ismert az állapota."),
  roadmap("rm60-rules", "AP", 60, 58, c => c.s.opportunity >= 2, "Írd le az automatizálás szabályait", "A legígéretesebb automatizálási feladatot írd le ha–akkor szabályokkal, és ellenőrizd tíz közelmúltbeli eseten.", "A szabályok papíron helyesen kezelnek tíz valós esetet."),
  roadmap("rm60-review-dates", "SS", 60, 20, always, "Tartsd naprakészen a munkaleírásokat", "Minden munkaleíráshoz rendelj felelőst és hat hónapon belüli felülvizsgálati dátumot.", "Nincs munkaleírás felelős és felülvizsgálati dátum nélkül."),
  // 61–90. nap: automatizálás, mérhető AI-használat, az eredmények fenntartása.
  roadmap("rm90-automate", "AP", 90, 70, c => c.s.opportunity >= 2 && c.s.automationReady >= 2, "Automatizáld a legígéretesebb feladatot", "Automatizálj egy feladatot, kijelölt felelőssel és egyoldalas üzemeltetési leírással. Mérd meg a megtakarított órákat a kiinduló állapothoz képest.", "Az automatizálás működik, a felelős kijelölve, az óramegtakarítás megmérve."),
  roadmap("rm90-automate-gate", "AP", 90, 70, c => c.s.opportunity >= 2 && c.s.automationReady < 2, "Feltételek alapján dönts az automatizálásról", "Csak akkor automatizálj, ha a kiválasztott folyamat már négy hete az egységes munkaleírás szerint megy, a hibaaránya stabil, és megvannak a szabályok, az adathozzáférés és a felelős. Egyébként folytasd az előkészítést.", "Négy hét adatai és a felkészültség ellenőrzése alapján eldőlt, hogy belevágtok vagy halasztotok."),
  roadmap("rm90-ai-pilot", "AI", 90, 60, c => c.s.foundation >= 2, "Indíts mért AI-próbát", "Próbáljatok ki négy hétig egy felhasználási esetet engedélyezett eszközzel, és teszteljétek 20 korábbi eseten, amelyeknél ismert a helyes válasz.", "Megvannak az előtte–utána idő- és hibaadatok, és eldőlt, folytatjátok-e vagy leállítjátok."),
  roadmap("rm90-ai-prepare", "AI", 90, 60, c => c.s.foundation < 2, "Készülj fel az AI használatára eszközvásárlás nélkül", "Írd le a 20 leggyakoribb kérdésre adott választ, és gyűjts össze 20 korábbi esetet a helyes eredménnyel együtt. Egyelőre ne vásárolj eszközt.", "Mindkét gyűjtemény elkészült, és van felelőse."),
  roadmap("rm90-sustain", "PO", 90, 50, always, "Ellenőrizd, mi maradt fenn", "Nézd meg a helyszínen, hogy még mindig az első 30 és 60 nap változtatásai szerint dolgoztok-e. Mérd meg újra a kiinduló mutatókat, és vesd össze az értékeket.", "Leírtátok az előtte–utána összehasonlítást, és tudjátok, miért kopott ki egy-egy változtatás."),
  roadmap("rm90-train", "PO", 90, 45, c => c.s.PO < LOW, "Építs belső problémamegoldó tudást", "Tanítsd meg a folyamat felelősének és két csapattagnak a problémamegoldás alapjait, például az 5 miért módszert és az egyszerű idősoros diagramokat, hogy a következő fejlesztéshez már ne kelljen külső segítség.", "A betanított csapat önállóan viszi végig a következő fejlesztést."),

  // Területi értékelések
  note("FW", "low", "A munka jóval többet áll, mint amennyit halad", "Az átfutási idő nagy része valószínűleg várakozás: a postafiókokban, jóváhagyásra vagy hiányzó információra. A várakozást általában könnyebb megszüntetni, mint magát a munkát felgyorsítani.", "Mielőtt máson változtatsz, keresd meg a leghosszabb várakozást."),
  note("FW", "mid", "A munka halad, de az átadásoknál lassul", "A feladatok elkészülnek, de lelassulnak, amikor más kezébe kerülnek. Egy csapaton belülről ezek a várakozások ritkán látszanak.", "Tedd láthatóvá az átadásokat, és szüntesd meg a leghosszabb várakozást."),
  note("FW", "high", "A munka gördülékenyen halad", "A kérések gyorsan haladnak, a javítások kézben vannak. Most az a kockázat, hogy visszacsúsztok: látható cél nélkül az átfutási idő megint nőhet.", "Határozz meg átfutásiidő-célt, és tedd láthatóvá."),
  note("SS", "low", "A munkamódszer az emberek fejében él", "A minőség attól függ, ki végzi aznap a munkát. Ez az automatizálásnak és az AI-nak is az egyik fő akadálya, mert a szoftvernek stabil folyamat kell.", "Írd le a kritikus lépéseket, és próbáltasd ki őket egy kollégával, aki még nem csinálta a feladatot."),
  note("SS", "mid", "Részben egységes a munkavégzés", "A munka egy része leírt módszer szerint megy, más része azon múlik, ki csinálja. A kivételeknél és a változásoknál bomlik meg az egységesség.", "Rögzítsd a kivételek kezelését, és folyamatváltozáskor frissítsd a munkaleírásokat."),
  note("SS", "high", "Stabil és egységes a munkavégzés", "Ugyanazt a munkát ugyanúgy csináljátok. Pont erre az alapra van szüksége az automatizálásnak és az AI-nak.", "A munkaleírásoknak legyen felelőse és rendszeres felülvizsgálata, hogy ne avuljanak el."),
  note("DM", "low", "A döntések véleményekre épülnek", "Megbízható számok nélkül nem látszik, segített-e egy változtatás, és az AI vagy az automatizálás megtérülése is csak becslés marad.", "Mielőtt jelentéskészítő eszközbe fektetsz, kezdj el kézzel mérni egy mutatót."),
  note("DM", "mid", "Vannak számok, de a bizalom részleges", "Az adatok megvannak, de a definíciók eltérnek, és a jelentések sok kézi munkával készülnek. Ahelyett, hogy a számok alapján dolgoznátok, magukról a számokról megy a vita.", "Állapodjatok meg a fontos mutatók meghatározásában és forrásában."),
  note("DM", "high", "Az adatokra lehet döntést építeni", "Megbíztok a számokban, és használjátok is őket. A következő lépés, hogy a trendekre figyeljetek, ne az egyes értékekre reagáljatok.", "Idősoros diagramokat tekintsetek át pillanatnyi állapotképek helyett."),
  note("AP", "low", "Még hiányoznak az automatizálás feltételei", "A szabályok nincsenek leírva, a rendszerek nehezen adnak ki adatot, vagy a korábbi eszközöket abbahagytátok. Most drága és törékeny lenne az automatizálás.", "Eszközválasztás előtt írd le a szabályokat, és igazold az adathozzáférést."),
  note("AP", "mid", "Az automatizálás feltételei részben adottak", "Az alapok egy része már megvan. Azon múlik, hogy tartósan működik-e majd az automatizálás, hogy pótoljátok-e a hiányzó szabályokat, adathozzáférést és felelősöket.", "Egy kiválasztott feladatnál pótold a hiányzó feltételeket, mielőtt automatizálod."),
  note("AP", "high", "Adottak az automatizálás feltételei", "A szabályok, a rendszerhozzáférés és a felelősségek nagyrészt rendezettek. Azt a feladatot válaszd, amelyen a legtöbb órát lehet megspórolni, ne azt, amire az eszköz éppen képes.", "Automatizáld a legígéretesebb feladatot, és mérd meg az óramegtakarítást."),
  note("AI", "low", "Hiányoznak az AI használatának alapjai", "Nincs világos adatkezelési szabály, nincs leírva a szükséges tudás, vagy hiányzik az eredmények ellenőrzési módja. Ilyen helyzetben az AI inkább csak a kockázatot növeli.", "Először tedd közzé az adatkezelési szabályt, és írd le a szükséges tudást."),
  note("AI", "mid", "Az AI alapjai részben megvannak", "Vannak már szabályok és leírt tudás, de a felhasználási esetek még nem elég konkrétak, vagy senki nem méri az eredményüket.", "Válassz egy felhasználási esetet mérőszámmal és az eredmény ellenőrzésére alkalmas módszerrel."),
  note("AI", "high", "Készen álltok a mért AI-használatra", "Megvannak a szabályok, a tudás és az ellenőrzések. Most az a kockázat, hogy senki nem méri, mit hoz az AI.", "Minden felhasználási esetet mérj a kiinduló állapothoz képest."),
  note("PO", "low", "A fejlesztéseknek nincs gazdája", "Ha nincs felelős, nincs rá idő, és nem merik jelezni a problémákat, a fejlesztések eredménye néhány hónap alatt elvész.", "Jelölj ki felelőst, és legyen hol jelezni a problémákat."),
  note("PO", "mid", "Vannak felelősök, de még nem elég erős a gyakorlat", "Egyes fejlesztések megmaradnak, mások elhalnak. Ez inkább azon múlik, ki áll mögöttük, mint a bevett szokásokon.", "Tedd szokássá a rövid havi áttekintést."),
  note("PO", "high", "A fejlesztés a működés része", "Az emberek szólnak, ha baj van, felelősséget vállalnak a folyamatokért, és megtartják az eredményeket. Ezt a legnehezebb kialakítani, és nálatok már működik.", "Add tovább ezt a gyakorlatot azoknak a csapatoknak, ahol még nem alakult ki."),

  // Következő lépés
  nextStep("ns-fix-first", "fix-first", c => c.s.foundation < 1.5, t(
    "Először ezt a három dolgot rendezd",
    "Ebben a riportban a folyamat stabilitása ({score.SS}) és az adatok ({score.DM}) a leggyengébb alapok.",
    "A képzés, a workshop és az automatizálás is bizonytalan alapokra épülne. Most az ütemterv első 30 napjának feladataival érheted el a legtöbbet.",
    "Haladj végig az 1–30. nap feladatain. Amikor beszélünk, átnézzük őket, és eldöntjük, mit tudsz egyedül megoldani, és hol éri meg segítséget kérni.",
    "")),
  nextStep("ns-training", "training", c => c.s.PO < 2, t(
    "Képzés, hogy a fejlesztések eredménye fennmaradjon",
    "Az emberek és felelősségek terület ({score.PO}) a többit is visszahúzza.",
    "Ha senki nem viszi tovább a módszert, a projekt végével a fejlesztés eredménye is elvész. Ha a folyamat felelőse és néhány csapattag megtanulja, a következő fejlesztéseket már magatok is végig tudjátok vinni.",
    "Gyakorlati Lean Six Sigma képzés a folyamat felelősének és két-három csapattagnak, a saját folyamataitokra épülő esettanulmányokkal.",
    ""),
    { bySize: { "1-10": { action: "A hivatalos tanúsítványokat most hagyd ki. Egy egynapos gyakorlati alkalom az egész csapatnak, valamelyik saját folyamatotokon, elég ahhoz, hogy elinduljon a közös gyakorlat." } } }),
  nextStep("ns-project", "project", c => c.s.opportunity >= 3 && c.s.automationReady >= 2, t(
    "Automatizálási projekt mért eredménnyel",
    "Sok a szabályalapú kézi munka (lehetőség: {score.opportunity}), és az alapok is elég stabilak (stabilitás: {score.SS}, adatok: {score.DM}).",
    "Ilyen helyzetben térülhet meg a leggyorsabban az automatizálás. Az a kockázat, ha a feladatot az alapján választjátok ki, mit tud az eszköz, és nem az alapján, hol spórolható meg a legtöbb óra.",
    "Megvalósítási projekt: mérjük fel a legígéretesebb feladat kiinduló állapotát, írjuk le a szabályait, automatizáljuk kijelölt felelőssel és üzemeltetési leírással, majd mérjük meg a megtakarított órákat.",
    "")),
  nextStep("ns-workshop-ai", "workshop", c => c.score("AI5") >= 2, t(
    "Workshop egy konkrét AI-felhasználáshoz",
    "Már van konkrét felhasználási ötleted: „{AI5}”.",
    "A legtöbb cég kihagyja a lépést az ötlet és egy valóban tesztelhető próba között. Egy célzott alkalom alatt a felhasználási esetből mérőszámokkal ellátott tesztterv lesz.",
    "Félnapos AI-workshop: pontosítjuk a felhasználási esetet, meghatározzuk a helyes eredmény feltételeit, teszteseteket gyűjtünk, és kijelöljük a próba mérőszámát.",
    "")),
  nextStep("ns-workshop-vsm", "workshop", always, t(
    "Folyamatfeltérképező workshop",
    "A leggyengébb területed: {lowest}.",
    "Az alapok megvannak; a következő előrelépés abban rejlik, hogyan halad a munka a csapatok között, és ez egy csapaton belülről nem látszik.",
    "Egynapos értékáram-térképező workshop a munkát végző kollégákkal: feltérképezünk egy kulcsfolyamatot, megkeressük a legnagyobb várakozásokat, és három konkrét intézkedésről döntünk.",
    "")),
];
