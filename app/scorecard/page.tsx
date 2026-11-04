import { site } from "../../data/site";
import type { Metadata } from "next";
import IntakeForm from "../../components/scorecard/IntakeForm";
import SamplePreview from "../../components/scorecard/SamplePreview";
import { getLocale } from "../../lib/i18n-server";
import { localizePath } from "../../lib/i18n";

// Copy: docs/content-plan/04-copy-scorecard-en-hu.md §1.
const copy = {
  en: {
    metaTitle: "Free Discovery Scorecard: score one process in 8 minutes | Grismont",
    metaDescription: "Answer 30 questions about one process. Get six scores, three quick wins, the main risk and a 90-day roadmap. Free, on screen and as PDF.",
    label: "Discovery Scorecard", title: "One process. A clearer next step.",
    intro: "Pick a process you know well, for example the weekly report, order handling or month-end closing. Answer 30 short questions. A best estimate is fine.",
    youGet: "You get:", items: ["six scores with short explanations", "three quick wins", "the main risk to fix before automation or AI", "a 90-day roadmap"],
    reassurance: "Free · about 8 minutes · answers save after each question · no obligation to book",
    privacy: "Please leave out confidential or personal details.", sample: "See a sample report first",
  },
  hu: {
    metaTitle: "Ingyenes Folyamat-pontozó: értékelj egy folyamatot 8 perc alatt | Grismont",
    metaDescription: "Válaszolj 30 kérdésre egy folyamatról. Hat pontszámot, három gyors javítást, a fő kockázatot és 90 napos ütemtervet kapsz. Ingyenes, azonnal és PDF-ben.",
    label: "Folyamat-pontozó", title: "Egy folyamat. Egy tisztább következő lépés.",
    intro: "Válassz egy folyamatot, amit jól ismersz, például a heti riportot, a rendeléskezelést vagy a havi zárást. Válaszolj 30 rövid kérdésre. A legjobb becslésed is elég.",
    youGet: "Ezt kapod:", items: ["hat pontszám rövid magyarázattal", "három gyors javítás", "a fő kockázat, amit az automatizálás vagy az AI előtt rendezni kell", "90 napos ütemterv"],
    reassurance: "Ingyenes · kb. 8 perc · minden válasz után mentünk · semmire nem kötelez",
    privacy: "Bizalmas vagy személyes adatokat kérlek, ne adj meg.", sample: "Előbb megnézem a mintajelentést",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const c = copy[await getLocale()];
  return { title: { absolute: c.metaTitle }, description: c.metaDescription };
}

export default async function ScorecardIntake() {
  const locale = await getLocale();
  const c = copy[locale];
  return (
    <main id="main-content" className="gm-shell sc-intake-page">
      <div className="sc-intake-head">
        <div className="gm-label">{c.label}</div>
        <h1>{c.title}</h1>
        <p className="gm-lead">{c.intro}</p>
      </div>
      <IntakeForm locale={locale} />
      <div className="sc-intake-rest">
        <p className="sc-get-title">{c.youGet}</p>
        <ul className="sc-get">{c.items.map(item => <li key={item}>{item}</li>)}</ul>
        <SamplePreview locale={locale} sampleLabel={c.sample} sampleHref={site.sampleReportPublished ? localizePath(locale, "/scorecard/sample") : undefined} />
        <p className="sc-reassure">{c.reassurance}<br />{c.privacy}</p>
      </div>
    </main>
  );
}
