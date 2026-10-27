import type { Metadata } from "next";
import ReportView from "../../../components/scorecard/ReportView";
import { getLocale } from "../../../lib/i18n-server";
import { localizePath } from "../../../lib/i18n";
import { sampleReport } from "../../../lib/scorecard/sample";

export async function generateMetadata(): Promise<Metadata> {
  return await getLocale() === "hu"
    ? { title: "Mintajelentés — kitalált cég", description: "Így néz ki a Folyamat-pontozó eredménye: hat pontszám, három gyors javítás, a fő kockázat és 90 napos ütemterv." }
    : { title: "Sample report — fictional company", description: "What a Discovery Scorecard report looks like: six scores, three quick wins, the main risk and a 90-day roadmap." };
}

export default async function SampleReportPage() {
  const locale = await getLocale();
  const hu = locale === "hu";
  return (
    <>
      <div className="gm-shell sc-sample-banner" role="note">
        <strong>{hu ? "Mintajelentés — kitalált cég" : "Sample report — fictional company"}</strong>
        <span>{hu ? "Példa Kft., 85 fő, fémalkatrész-gyártó. A vizsgált folyamat: vevői rendelésből gyártási rendelés." : "Példa Kft., 85 people, metal parts manufacturer. Process: customer order to production order."}</span>
        <a className="gm-cta" href={localizePath(locale, "/scorecard")}>{hu ? "Kérem a saját eredményemet" : "Get your own report"} <span aria-hidden="true">→</span></a>
      </div>
      <ReportView r={sampleReport(locale)} locale={locale} sample />
      <div className="gm-shell sc-sample-banner sc-sample-foot">
        <strong>{hu ? "Ilyen jelentést kapsz a saját folyamatodról, kb. 8 perc alatt." : "You get a report like this for your own process in about 8 minutes."}</strong>
        <a className="gm-cta" href={localizePath(locale, "/scorecard")}>{hu ? "Kérem a saját eredményemet" : "Get your own report"} <span aria-hidden="true">→</span></a>
      </div>
    </>
  );
}
