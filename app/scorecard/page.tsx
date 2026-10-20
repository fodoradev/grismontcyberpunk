import type { Metadata } from "next";
import IntakeForm from "../../components/scorecard/IntakeForm";
import { getQuestionContent } from "../../content/scorecard/questions";
import { getLocale } from "../../lib/i18n-server";
import { AREAS } from "../../lib/scorecard/types";

export async function generateMetadata(): Promise<Metadata> {
  const hu = await getLocale() === "hu";
  return {
    title: hu ? "Folyamatfelmérő" : "Discovery Scorecard",
    description: hu ? "Harminc konkrét kérdés a folyamatodról, az adatokról, az automatizálásról és az AI-felkészültségről, utána pedig egy riport, amely alapján el tudsz indulni." : "Thirty concrete questions about your processes, data, automation and AI readiness, and a report you can act on.",
  };
}

export default async function ScorecardIntake() {
  const locale = await getLocale();
  const hu = locale === "hu";
  const { AREA_NAMES } = getQuestionContent(locale);
  return (
    <main id="main-content" className="gm-shell sc-page">
      <div className="sc-intro">
        <div className="gm-label">{hu ? "Folyamatfelmérő" : "Discovery Scorecard"}</div>
        <h1>{hu ? "Egy folyamat. Világosabb következő lépés." : "One process. A clearer next step."}</h1>
        <p className="gm-lead">{hu ? "Válassz egy folyamatot, amelyet jól ismersz, és válaszolj harminc kérdésre arról, hogyan működik. Mindig azt jelöld, amelyik a legközelebb áll a helyzetetekhez. Hat pontszámot, három gyorsan megvalósítható javaslatot és egy 90 napos ütemtervet kapsz, a képernyőn és PDF-ben e-mailben is." : "Choose a process you know well, then answer thirty questions about how it works. Pick the situation closest to yours. You’ll get six scores, three suggested quick wins and a 90-day roadmap, on screen and as a PDF by email."}</p>
        <ol className="sc-areas">{AREAS.map((a, i) => <li key={a}><span>{String(i + 1).padStart(2, "0")} /</span>{AREA_NAMES[a]}</li>)}</ol>
        <p className="sc-hint">{hu ? "Ingyenes · Körülbelül 7–8 perc · Semmire nem kötelez." : "Free · About 7–8 minutes · No obligation to book anything."}<br />{hu ? "Elég, ha megbecsülöd. Bizalmas vagy személyes adatokat kérlek, ne adj meg." : "Your best estimate is fine. Please leave out confidential or personal details."}</p>
      </div>
      <IntakeForm locale={locale} />
    </main>
  );
}
