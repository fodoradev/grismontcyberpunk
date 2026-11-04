import type { Locale } from "../../lib/i18n";
import { business } from "../../data/business";
import { formatFt, offers, vatNote, type OfferId } from "../../data/offers";
import { known, site } from "../../data/site";

/** Copy from docs/content-plan/02-copy-home-en.md and 03-copy-home-hu.md. Facts come from data/site.ts and data/offers.ts. */

export type Problem = { name: string; title: string; text: string; before: string[]; after: string[]; result?: string };
export type ServiceCard = { id: OfferId; label?: string; name: string; title: string; text: string; topicsLabel?: string; topics?: string[]; guarantee?: string; price: { regular: string; launch: string; note: string }; cta: string };
export type Faq = { question: string; answer: string };

const en = {
  meta: {
    title: "Process improvement, training and automation for operations | Grismont",
    description: "Faster orders, reports and handovers for manufacturing, logistics and office teams. Practical Lean training, process improvement, automation and AI. Start with a free 8-minute scorecard.",
    ogTitle: "Less admin around operations | Grismont",
    ogDescription: "Process first. Then automation and AI, only where it pays.",
  },
  hero: {
    eyebrow: "Lean Six Sigma and AI automation for manufacturing, logistics and the office teams behind them",
    title: ["Get back the hours your team loses to ", "admin", "."],
    sub: "Orders, reports, approvals and handovers take too long and break too often. I fix the process first, train your team to keep it working, and automate only what pays.",
    start: "Get your free scorecard", under: "8 minutes · 30 questions · report on screen and as PDF",
    book: "Book a 20-minute call", tagline: "Good work. Fewer tangles.",
    person: "Lean Six Sigma Green Belt", personNote: "I do the work with you, in English or Hungarian.",
    sticky: "Start the scorecard", stickyNote: "Free · 8 minutes",
  },
  calculator: {
    title: "What does one weekly task cost you?",
    intro: "Pick a task that comes back every week, then move the sliders.",
    people: "People doing it", hours: "Hours each, per week", result: "Hours a year",
    weeks: "That is about {n} full working weeks.",
    block: "Each square is one 40-hour week.", note: "Your numbers × 46 working weeks. An estimate, not a promise.",
    cta: "Find out where the hours go",
  },
  strip: {
    label: "Experience and approach",
    greenBelt: "Lean Six Sigma Green Belt", greenBeltShort: ["Lean Six Sigma Green Belt", "I build the automations and tools myself"],
    years: (years: string) => `${years} years in operations and advisory`,
    experience: ["Operations and advisory experience", "Experience on both sides of the project"],
    result: "Measured result",
    languages: ["Hungarian and English", "On-site in Hungary, online elsewhere"],
  },
  problems: {
    label: "The problems", title: "Where the hours go",
    intro: "The shop floor is often well organised. The work around it is not. These three problems appear in almost every company I see.",
    closing: "Sometimes the answer is a better checklist. Sometimes it is a custom tool. We find out before anything is built.",
    labels: { choose: "Choose a problem", situation: "Recognise this?", before: "Before", after: "After", happens: "What happens", result: "Typical result", score: "Score a process like this" },
    cards: [
      { name: "The weekly report", title: "The weekly report takes a day", text: "Someone exports data from two systems, copies it into Excel, checks it by hand and sends it. Every week. When that person is on holiday, the report is late or wrong.", before: ["Export", "Copy and paste", "Check by hand", "Fix errors", "Send"], after: ["One agreed data source", "Automatic update", "Review of exceptions only"] },
      { name: "The approval loop", title: "The order waits for three signatures", text: "A purchase request, a quote or a production change goes round by email. Nobody knows where it is. The customer waits. The same questions are asked every time.", before: ["Email", "Forward", "“Who has it?”", "Reminder", "Approval", "Re-type into the system"], after: ["One form with the right data", "Clear approval rules", "Automatic routing", "Status visible to all"] },
      { name: "The AI idea", title: "“We should do something with AI”", text: "Everybody has an idea, but nobody knows which task is worth it. A tool is bought before the process is clear. Six months later, nobody uses it.", before: ["Buy a tool", "Try it on everything", "Little use", "Disappointment"], after: ["List the tasks", "Measure time and errors", "Pick one task with a clear gain", "Test for 2 weeks", "Decide"] },
    ] as Problem[],
  },
  services: {
    label: "Training & services", title: "Ways to work together",
    intro: "Most clients start with a training or a half-day workshop. Both have a fixed price, and both work on your real processes, not on textbook examples.",
    launch: {
      title: `Launch price for the first ${offers.launchPartners} partner companies`,
      text: `I am building my reference list. The first ${offers.launchPartners} partner companies get the launch price. In return, we publish the measured results together — anonymised if you prefer.`,
      placesLeft: (left: number | string) => `${left} of ${offers.launchPartners} places left.`,
    },
    launchPrice: "launch price", from: (price: string) => `from ${price}`, regularLabel: "Regular price", launchLabel: "Launch price",
    credited: "Credited in full if you continue.",
    guarantee: (hours: number | string) => `If we do not find at least ${hours} hours of monthly saving, you do not pay.`,
    cards: [
      { id: "training", label: "Most popular first step", name: "Training that pays for itself", title: "Team training", text: "A one-day, hands-on training for up to 12 people. Each team leaves with one real improvement to make. After 30 days we meet online and measure the result.", topicsLabel: "Topics (choose one)", topics: ["Lean in the office: find and remove waste in admin work", "Practical problem solving: get to the root cause, not the first answer", "AI at work: safe, useful AI use for everyday tasks"], cta: "Plan a team training" },
      { id: "workshop", name: "Process discovery workshop", title: "Half-day workshop", text: "We map one process together, find where the time and errors go, and agree what to fix first. You get a written summary with the three most valuable changes.", cta: "Book a workshop" },
      { id: "programme", name: "Improvement programme", title: "6–8 week programme", text: "Three training days with team projects in between. Your people learn the method while they improve real processes. At the end, you get a results report with the measured savings.", cta: "Discuss a programme" },
      { id: "sprint", name: "Process Sprint and automation", title: "Done with you", text: "For one important process: baseline, fix, automate where it pays, measure the result. 2–4 weeks. Automation and AI tools are quoted after the sprint, when the process is stable.", cta: "Talk about a sprint" },
    ] as Omit<ServiceCard, "price" | "guarantee">[],
    notSure: "Not sure which one fits? Start with the free scorecard. It tells you where to start.", notSureLink: "Start the scorecard",
  },
  method: {
    label: "How I work", title: "Process first. Technology second.",
    intro: "Automating a bad process gives you a fast bad process. So the order is always the same.",
    steps: [
      { title: "Find the friction.", text: "Map the work as it really happens. Find the waiting, re-typing and rework.", tag: "Lean" },
      { title: "Make it reliable.", text: "Agree one standard. Measure it. Remove the causes of errors.", tag: "Six Sigma" },
      { title: "Automate the routine.", text: "Let software do the repetitive steps and handovers.", tag: "Automation" },
      { title: "Add AI with a purpose.", text: "Use AI where it removes real work, with clear data rules.", tag: "AI" },
    ],
    closing: "Every step has a reason and a number behind it.",
  },
  proof: {
    label: "Results", title: "Results, not promises",
    intro: "Examples from my past work and from partner projects. Numbers are measured, not estimated.",
    problem: "Problem", action: "What we did", result: "Result", read: "Read the case",
  },
  scorecard: {
    label: "The free scorecard", title: "Not sure where to start? Score one process.",
    intro: "Pick one process you know well and answer 30 short questions.",
    areasTitle: "Six things worth looking at.",
    areas: [["Flow and waste", "Where does work wait, repeat or get passed back?"], ["Stability and standards", "Can people follow a consistent way of working?"], ["Data and measurement", "Can you trust the numbers you use to decide?"], ["Automation potential", "Which repetitive tasks follow clear rules?"], ["AI readiness", "Are the process, data and safeguards ready?"], ["People and ownership", "Who will look after the improvement?"]],
    name: "Discovery Scorecard", free: "Free", youGet: "You get:",
    items: ["six scores with short explanations", "three quick wins you can start next week", "the main risk to fix before you automate or use AI", "a 90-day roadmap"],
    small: "Free · 8 minutes · on screen and as PDF · no obligation to book",
    cta: "Start the scorecard", sample: "See the full sample report",
    preview: { label: "Sample report", company: "Fictional company", risk: "Biggest risk", win: "First quick win", scale: "Scores from 0 to 4" },
  },
  about: {
    label: "About", hi: (name: string) => `Hi, I'm ${name}.`,
    intro: (years?: string, roles?: string) => years && roles ? `I have spent ${years} years in ${roles} roles.` : "I have worked in operations, continuous improvement and advisory roles.",
    processes: (list?: string) => `Most of that time I worked in the office processes that keep a company running${list ? `: ${list}` : ""}. I saw the same thing everywhere: good people losing hours to re-typing, chasing and checking.`,
    text: ["So I learned to fix it. First with Lean and Six Sigma, then with automation, and now with AI. I am a Lean Six Sigma Green Belt, and I build the automations and tools myself.", "I work in Hungarian and English, on-site in Hungary and online anywhere."],
    notebookLabel: "A question I keep coming back to", notebook: "“What would make this easier for the person doing the work?”",
    facts: ["Lean Six Sigma Green Belt", "Process improvement + development", "Working in Hungarian & English"],
    timeline: { caption: "Career, in short", years: "Years", role: "Role", result: "One result" },
    linkedin: "LinkedIn", certificate: "Green Belt certificate",
  },
  next: {
    label: "What happens next", title: "What happens after you get in touch",
    steps: [
      { title: "You send a short message or book a call.", text: "I reply within one working day." },
      { title: "20-minute call.", text: "We talk about one process or training need. No sales pitch." },
      { title: "Written proposal.", text: "Scope, date and fixed price, within 2 working days." },
      { title: "We start.", text: "Usually within 2–3 weeks." },
    ],
  },
  faq: {
    label: "A few practical questions", title: "Before we start", note: "Something else on your mind?", link: "Ask me directly",
    needLss: { question: "Do my people need to know Lean Six Sigma?", answer: "No. I explain everything in plain language, using your own processes." },
    notFactory: { question: "We are not a factory. Is this for us?", answer: "Yes. Reports, approvals, handovers and re-typing look the same in an office, a warehouse or a service company. The examples change; the method does not." },
    launch: { question: "Why is there a launch price?", answer: `I am building my reference list. The first ${offers.launchPartners} partners pay less. In return, we publish the measured results together. You decide if your company name appears.` },
    guarantee: (hours: number | string) => ({ question: "What if the workshop finds nothing?", answer: `If we do not find at least ${hours} hours of monthly saving, you do not pay for the workshop.` }),
    small: { question: "Can we start with one small problem?", answer: "Yes. That is the best way to start. One process, one clear result." },
    tools: (tools?: string) => ({ question: "Which tools do you use?", answer: `The tool follows the process, your systems and your IT rules. Often it is what you already have (Excel, Microsoft 365, Google Workspace).${tools ? ` I also build with ${tools}.` : ""}` }),
    data: { question: "What about our data?", answer: "We agree the data rules before any work starts. The scorecard asks about the process only. It does not need customer records or personal data." },
    abroad: { question: "Do you work outside Hungary?", answer: "Yes, online, in English or Hungarian." },
    registered: (number: string) => ({ question: "Is the training registered as adult training?", answer: `Yes. Registration number: ${number}` }),
  },
  contact: {
    label: "Contact", title: "Tell me what takes too long.",
    text: "One task, one report, one handover — that is enough to start. I reply within one working day.",
    preferTalk: "Prefer to talk?", book: "Book a 20-minute call", email: "Email", orStart: "Or start with the", scorecard: "free scorecard",
  },
};

type HomeCopy = typeof en;

const hu: HomeCopy = {
  meta: {
    title: "Folyamatfejlesztés, tréning és automatizálás gyártó- és logisztikai cégeknek | Grismont",
    description: "Gyorsabb rendelés, riport, jóváhagyás és átadás-átvétel. Gyakorlati Lean tréning, folyamatfejlesztés, automatizálás és AI. Kezdd egy ingyenes, 8 perces Folyamat-pontozóval.",
    ogTitle: "Kevesebb adminisztráció a működés körül | Grismont",
    ogDescription: "Először a folyamat. Utána automatizálás és AI, de csak ott, ahol megéri.",
  },
  hero: {
    eyebrow: "Lean Six Sigma és AI-automatizálás gyártó- és logisztikai cégeknek, és az irodai csapatoknak, akik működtetik őket",
    title: ["Szerezd vissza az órákat, amelyeket a csapatod ", "adminisztrációval", " tölt."],
    sub: "A rendelés, a riport, a jóváhagyás és az átadás-átvétel túl sokáig tart, és túl gyakran csúszik el. Először a folyamatot rendbe teszem, utána megtanítom a csapatodnak, hogyan tartsa rendben, és csak azt automatizálom, ami megtérül.",
    start: "Kérem az ingyenes Folyamat-pontozót", under: "8 perc · 30 kérdés · eredmény azonnal és PDF-ben",
    book: "Foglalj egy 20 perces hívást", tagline: "Jó munka, kevesebb gubanc.",
    person: "Lean Six Sigma Green Belt", personNote: "Veled együtt dolgozom, magyarul vagy angolul.",
    sticky: "Elkezdem", stickyNote: "Ingyenes · 8 perc",
  },
  calculator: {
    title: "Mennyibe kerül egyetlen heti feladat?",
    intro: "Válassz egy feladatot, ami minden héten visszatér, és húzd el a csúszkákat.",
    people: "Ennyien végzik", hours: "Fejenként ennyi óra hetente", result: "Óra évente",
    weeks: "Ez nagyjából {n} teljes munkahét.",
    block: "Minden négyzet egy 40 órás munkahét.", note: "A te számaid × 46 munkahét. Becslés, nem ígéret.",
    cta: "Megnézem, hová tűnnek az órák",
  },
  strip: {
    label: "Tapasztalat és szemlélet",
    greenBelt: "Lean Six Sigma Green Belt", greenBeltShort: ["Lean Six Sigma Green Belt", "Az automatizálásokat és eszközöket magam építem"],
    years: (years: string) => `${years} év operációs és tanácsadói munka`,
    experience: ["Operációs és tanácsadói tapasztalat", "Ismerem a projektek mindkét oldalát"],
    result: "Mért eredmény",
    languages: ["Magyarul és angolul", "Helyszínen Magyarországon, online bárhol"],
  },
  problems: {
    label: "A problémák", title: "Hová tűnnek el az órák?",
    intro: "Az üzem gyakran jól szervezett. A körülötte zajló munka sokszor nem. Ez a három probléma szinte minden cégnél előjön.",
    closing: "Néha a megoldás egy jobb ellenőrzőlista. Néha egy egyedi eszköz. Mielőtt bármit építenénk, ezt kiderítjük.",
    labels: { choose: "Válassz egy problémát", situation: "Ismerős?", before: "Előtte", after: "Utána", happens: "Mi történik", result: "Jellemző eredmény", score: "Pontozz egy ilyen folyamatot" },
    cards: [
      { name: "A heti riport", title: "A heti riport egy egész napot elvisz", text: "Valaki két rendszerből exportál, bemásolja Excelbe, kézzel ellenőrzi, majd elküldi. Minden héten. Ha ő szabadságon van, a riport késik vagy hibás.", before: ["Export", "Másolás-beillesztés", "Kézi ellenőrzés", "Hibajavítás", "Küldés"], after: ["Egy közös adatforrás", "Automatikus frissítés", "Csak az eltéréseket kell átnézni"] },
      { name: "A jóváhagyási kör", title: "A rendelés három aláírásra vár", text: "A beszerzési igény, az árajánlat vagy a gyártási módosítás e-mailben kering. Senki sem tudja, hol tart. Az ügyfél vár. Mindig ugyanazokat a kérdéseket kell feltenni.", before: ["E-mail", "Továbbítás", "„Kinél van?”", "Emlékeztető", "Jóváhagyás", "Újragépelés a rendszerbe"], after: ["Egy űrlap a szükséges adatokkal", "Világos jóváhagyási szabályok", "Automatikus továbbítás", "Mindenki látja, hol tart"] },
      { name: "Az AI-ötlet", title: "„Kezdenünk kéne valamit az AI-jal”", text: "Mindenkinek van ötlete, de senki sem tudja, melyik feladatnál éri meg. Előbb megveszik az eszközt, mint hogy a folyamat tiszta lenne. Fél év múlva senki sem használja.", before: ["Eszközvásárlás", "Kipróbálás mindenre", "Alig használják", "Csalódás"], after: ["Feladatok listája", "Idő és hibák mérése", "Egy feladat, ahol egyértelmű a nyereség", "2 hetes teszt", "Döntés"] },
    ],
  },
  services: {
    label: "Tréningek és szolgáltatások", title: "Így dolgozhatunk együtt",
    intro: "A legtöbb ügyfél egy tréninggel vagy egy félnapos workshoppal kezd. Mindkettő fix áras, és mindkettő a te valós folyamataidon dolgozik, nem tankönyvi példákon.",
    launch: {
      title: `Bevezető ár az első ${offers.launchPartners} partnercégnek`,
      text: `Most építem a referencialistámat. Az első ${offers.launchPartners} partnercég bevezető áron dolgozhat velem. Cserébe a mért eredményeket közösen publikáljuk — ha szeretnéd, névtelenül.`,
      placesLeft: (left: number | string) => `Még ${left} hely szabad az ${offers.launchPartners}-ből.`,
    },
    launchPrice: "bevezető ár", from: (price: string) => `${price}-tól`, regularLabel: "Normál ár", launchLabel: "Bevezető ár",
    credited: "Ha folytatjuk, a teljes összeget beszámítom.",
    guarantee: (hours: number | string) => `Ha nem találunk legalább havi ${hours} óra megtakarítást, nem kell fizetned.`,
    cards: [
      { id: "training", label: "A leggyakoribb első lépés", name: "Tréning, ami megtérül", title: "Csapattréning", text: "Egynapos, gyakorlati tréning legfeljebb 12 főnek. Minden csapat egy valós fejlesztési feladattal megy haza. 30 nap múlva online átnézzük és megmérjük az eredményt.", topicsLabel: "Témák (egyet választasz)", topics: ["Lean az irodában: a veszteségek megtalálása és megszüntetése az adminisztratív munkában", "Gyakorlati problémamegoldás: a valódi okig jutni, nem az első válaszig", "AI a munkában: biztonságos, hasznos AI-használat a napi feladatokhoz"], cta: "Csapattréninget tervezek" },
      { id: "workshop", name: "Folyamatfeltáró workshop", title: "Félnapos workshop", text: "Közösen feltérképezünk egy folyamatot, megkeressük, hol vész el az idő és hol keletkeznek a hibák, és megállapodunk, mivel kezdjük. Írásos összefoglalót kapsz a három legértékesebb változtatással.", cta: "Workshopot foglalok" },
      { id: "programme", name: "Fejlesztési program", title: "6–8 hetes program", text: "Három tréningnap, közöttük csapatprojektekkel. A kollégáid úgy tanulják meg a módszert, hogy közben valós folyamatokat fejlesztenek. A végén eredményjelentést kapsz a mért megtakarításokkal.", cta: "Beszéljünk a programról" },
      { id: "sprint", name: "Folyamat-sprint és automatizálás", title: "Veled együtt megcsináljuk", text: "Egy fontos folyamatra: kiinduló mérés, javítás, automatizálás ott, ahol megéri, és az eredmény mérése. 2–4 hét. Az automatizálási és AI-eszközökre a sprint után adok árajánlatot, amikor a folyamat már stabil.", cta: "Beszéljünk a sprintről" },
    ],
    notSure: "Nem tudod, melyik illik hozzád? Kezdd az ingyenes Folyamat-pontozóval. Megmutatja, hol érdemes kezdeni.", notSureLink: "Elkezdem a Folyamat-pontozót",
  },
  method: {
    label: "Így dolgozom", title: "Először a folyamat. Utána a technológia.",
    intro: "Ha egy rossz folyamatot automatizálsz, egy gyors rossz folyamatot kapsz. Ezért a sorrend mindig ugyanaz.",
    steps: [
      { title: "Megkeressük az elakadásokat.", text: "Feltérképezzük a munkát úgy, ahogy valóban zajlik. Megtaláljuk a várakozást, az újragépelést és az újramunkát.", tag: "Lean" },
      { title: "Megbízhatóvá tesszük.", text: "Megállapodunk egy közös standardban. Mérjük. Megszüntetjük a hibák okait.", tag: "Six Sigma" },
      { title: "Automatizáljuk a rutint.", text: "Az ismétlődő lépéseket és átadásokat a szoftver végzi.", tag: "Automatizálás" },
      { title: "Céllal használjuk az AI-t.", text: "Ott alkalmazzuk, ahol valódi munkát vesz le a válladról, világos adatkezelési szabályokkal.", tag: "AI" },
    ],
    closing: "Minden lépés mögött ott van az ok és a szám.",
  },
  proof: {
    label: "Eredmények", title: "Eredmények, nem ígéretek",
    intro: "Példák a korábbi munkáimból és a partnerprojektekből. A számok mértek, nem becsültek.",
    problem: "Probléma", action: "Mit csináltunk", result: "Eredmény", read: "Elolvasom az esetet",
  },
  scorecard: {
    label: "Ingyenes Folyamat-pontozó", title: "Nem tudod, hol kezdd? Pontozz egy folyamatot.",
    intro: "Válassz egy folyamatot, amit jól ismersz, és válaszolj 30 rövid kérdésre.",
    areasTitle: "Hat terület, amelyet érdemes megnézni.",
    areas: [["Munkafolyamat és veszteségek", "Hol áll, hol kell újracsinálni, és hol kerül vissza a munka?"], ["Stabilitás és egységes munkavégzés", "Mindenki ugyanúgy végzi ugyanazt a munkát?"], ["Adatok és mérés", "Megbízhatók a döntésekhez használt számok?"], ["Automatizálási lehetőségek", "Mely ismétlődő feladatok követnek egyértelmű szabályokat?"], ["AI-felkészültség", "Készen áll a folyamat, az adatok és a biztonsági szabályok?"], ["Emberek és felelősségek", "Ki gondoskodik róla, hogy a változás tartós legyen?"]],
    name: "Folyamat-pontozó", free: "Ingyenes", youGet: "Ezt kapod:",
    items: ["hat pontszám rövid magyarázattal", "három gyors javítás, amit már jövő héten elkezdhetsz", "a legfontosabb kockázat, amit az automatizálás vagy az AI előtt rendezni kell", "90 napos ütemterv"],
    small: "Ingyenes · 8 perc · azonnal és PDF-ben · semmire nem kötelez",
    cta: "Elkezdem a Folyamat-pontozót", sample: "A teljes mintajelentés megtekintése",
    preview: { label: "Mintajelentés", company: "Kitalált cég", risk: "Legnagyobb kockázat", win: "Első gyors javítás", scale: "Pontszám 0-tól 4-ig" },
  },
  about: {
    label: "Rólam", hi: (name: string) => `Szia, ${name} vagyok.`,
    intro: (years?: string, roles?: string) => years && roles ? `${years} évet dolgoztam ${roles} területen.` : "Dolgoztam operatív területen, folyamatfejlesztésben és tanácsadóként.",
    processes: (list?: string) => `Ennek nagy részében azokkal az irodai folyamatokkal foglalkoztam, amelyek egy céget működésben tartanak${list ? `: ${list}` : ""}. Mindenhol ugyanazt láttam: jó szakemberek órákat veszítenek újragépeléssel, utánajárással és ellenőrzéssel.`,
    text: ["Ezért megtanultam, hogyan lehet ezt megjavítani. Először Lean és Six Sigma módszerekkel, aztán automatizálással, most pedig AI-jal. Lean Six Sigma Green Belt vagyok, és az automatizálásokat és eszközöket magam építem.", "Magyarul és angolul dolgozom, helyszínen Magyarországon, online bárhol."],
    notebookLabel: "Egy kérdés, amihez mindig visszatérek", notebook: "„Mitől lenne ez könnyebb annak, aki a munkát végzi?”",
    facts: ["Lean Six Sigma Green Belt", "Folyamatfejlesztés + szoftverfejlesztés", "Magyar és angol nyelven"],
    timeline: { caption: "Szakmai idővonal, röviden", years: "Évek", role: "Szerep", result: "Egy eredmény" },
    linkedin: "LinkedIn", certificate: "Green Belt tanúsítvány",
  },
  next: {
    label: "Mi történik, ha írsz?", title: "Mi történik, miután felveszed velem a kapcsolatot?",
    steps: [
      { title: "Küldesz egy rövid üzenetet, vagy foglalsz egy hívást.", text: "Egy munkanapon belül válaszolok." },
      { title: "20 perces beszélgetés.", text: "Egy folyamatról vagy tréningigényről beszélünk. Nincs értékesítési rizsa." },
      { title: "Írásos ajánlat.", text: "Tartalom, időpont és fix ár, 2 munkanapon belül." },
      { title: "Elkezdjük.", text: "Általában 2–3 héten belül." },
    ],
  },
  faq: {
    label: "Néhány gyakorlati kérdés", title: "Mielőtt elkezdjük", note: "Van más kérdésed?", link: "Írj nekem közvetlenül",
    needLss: { question: "Kell, hogy a kollégáim ismerjék a Lean Six Sigmát?", answer: "Nem. Mindent egyszerűen elmagyarázok, a saját folyamataitokon keresztül." },
    notFactory: { question: "Nem gyártócég vagyunk. Nekünk is szól?", answer: "Igen. A riport, a jóváhagyás, az átadás-átvétel és az újragépelés ugyanúgy néz ki egy irodában, egy raktárban vagy egy szolgáltató cégnél. A példák mások, a módszer ugyanaz." },
    launch: { question: "Miért van bevezető ár?", answer: `Most építem a referencialistámat. Az első ${offers.launchPartners} partner kevesebbet fizet. Cserébe a mért eredményeket közösen publikáljuk. Te döntöd el, hogy a cégneved megjelenik-e.` },
    guarantee: (hours: number | string) => ({ question: "Mi van, ha a workshop nem talál semmit?", answer: `Ha nem találunk legalább havi ${hours} óra megtakarítást, a workshopért nem kell fizetned.` }),
    small: { question: "Kezdhetjük egyetlen kisebb problémával?", answer: "Igen. Ez a legjobb kezdés. Egy folyamat, egy világos eredmény." },
    tools: (tools?: string) => ({ question: "Milyen eszközöket használsz?", answer: `Az eszköz a folyamathoz, a rendszereitekhez és az IT-szabályaitokhoz igazodik. Sokszor az is elég, ami már megvan (Excel, Microsoft 365, Google Workspace).${tools ? ` Ezekkel is dolgozom: ${tools}.` : ""}` }),
    data: { question: "Mi a helyzet az adatainkkal?", answer: "Az adatkezelési szabályokban a munka előtt megállapodunk. A Folyamat-pontozó csak a folyamatra kérdez rá, ügyféladatokra vagy személyes adatokra nincs szüksége." },
    abroad: { question: "Dolgozol Magyarországon kívül is?", answer: "Igen, online, magyarul vagy angolul." },
    registered: (number: string) => ({ question: "Bejelentett felnőttképzés a tréning?", answer: `Igen. Nyilvántartási szám: ${number}` }),
  },
  contact: {
    label: "Kapcsolat", title: "Írd meg, mi tart túl sokáig.",
    text: "Egy feladat, egy riport, egy átadás — ennyi elég az induláshoz. Egy munkanapon belül válaszolok.",
    preferTalk: "Inkább beszélnél?", book: "Foglalj egy 20 perces hívást", email: "E-mail", orStart: "Vagy kezdd az", scorecard: "ingyenes Folyamat-pontozóval",
  },
};

const copy: Record<Locale, HomeCopy> = { en, hu };

export function getHomeMeta(locale: Locale) {
  return copy[locale].meta;
}

/** Home page copy with every fact-dependent block resolved: unknown facts drop their block or use the fallback. */
export function getHomeContent(locale: Locale) {
  const c = copy[locale];
  const name = known(site.fullName) ?? business.firstName;
  const issuer = known(site.greenBelt.issuer), year = known(site.greenBelt.year);
  const years = known(site.yearsExperience), areas = known(site.experienceAreas[locale]);
  const heroResult = known(site.heroResult[locale]);
  const strip: [string, string][] = [
    issuer ? [c.strip.greenBelt, [issuer, year].filter(Boolean).join(", ")] : [c.strip.greenBeltShort[0], c.strip.greenBeltShort[1]],
    years && areas ? [c.strip.years(years), areas] : [c.strip.experience[0], c.strip.experience[1]],
    heroResult ? [c.strip.result, heroResult] : [c.strip.languages[0], c.strip.languages[1]],
  ];

  const weeklyResult = known(site.weeklyReportResult[locale]);
  const problems = c.problems.cards.map((card, i) => (i === 0 && weeklyResult ? { ...card, result: weeklyResult } : card));

  const vat = vatNote(locale);
  const hours = known(offers.guaranteeHours);
  const price = (id: OfferId) => {
    const p = offers.prices[id];
    const fmt = (n: number) => (p.from ? c.services.from(formatFt(n)) : formatFt(n));
    return { regular: fmt(p.regular), launch: fmt(p.launch), note: [c.services.launchPrice, vat].filter(Boolean).join(" · ") };
  };
  const services: ServiceCard[] = c.services.cards.map(card => ({
    ...card,
    ...(card.id === "workshop" && hours !== undefined ? { guarantee: c.services.guarantee(hours) } : {}),
    price: card.id === "workshop" ? { ...price(card.id), note: `${price(card.id).note}. ${c.services.credited}` } : price(card.id),
  }));
  const placesLeft = known(offers.launchPlacesLeft);

  const regNo = known(site.adultTrainingRegistration);
  const faqs: Faq[] = [
    c.faq.needLss, c.faq.notFactory, c.faq.launch,
    ...(hours !== undefined ? [c.faq.guarantee(hours)] : []),
    c.faq.small, c.faq.tools(known(site.tools)), c.faq.data, c.faq.abroad,
    ...(regNo ? [c.faq.registered(regNo)] : []),
  ];

  const caseStudies = site.caseStudies[locale];
  const testimonial = site.testimonial?.[locale];
  return {
    ...c,
    strip: { label: c.strip.label, items: strip },
    problems: { ...c.problems, cards: problems },
    services: { ...c.services, cards: services, placesLeft: placesLeft !== undefined ? c.services.launch.placesLeft(placesLeft) : undefined },
    // [PROOF]: the section appears once at least two real case studies exist.
    proof: caseStudies.length >= 2 ? { ...c.proof, cases: caseStudies, testimonial } : undefined,
    about: {
      ...c.about,
      title: c.about.hi(name), name,
      paragraphs: [`${c.about.intro(years, known(site.aboutRoles[locale]))} ${c.about.processes(known(site.aboutProcesses[locale]))}`, ...c.about.text],
      timelineRows: site.timeline[locale],
      links: [
        ...(known(site.linkedinUrl) ? [{ href: site.linkedinUrl, text: c.about.linkedin }] : []),
        ...(known(site.greenBelt.certificateUrl) ? [{ href: site.greenBelt.certificateUrl, text: c.about.certificate }] : []),
      ],
    },
    faq: { ...c.faq, items: faqs },
  };
}
