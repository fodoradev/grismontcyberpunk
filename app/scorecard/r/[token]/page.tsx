import type { Metadata } from "next";
import ReportView from "../../../../components/scorecard/ReportView";
import ScorecardMessage from "../../../../components/scorecard/ScorecardMessage";
import { getReportByToken } from "../../../../lib/scorecard/store";
import { translateReport } from "../../../../lib/scorecard/report";
import { getLocale } from "../../../../lib/i18n-server";
import { localizePath } from "../../../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await getLocale() === "hu" ? "A Folyamat-pontozód riportja" : "Your scorecard report", referrer: "no-referrer" };
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const locale = await getLocale();
  const hu = locale === "hu";
  const { token } = await params;
  const report = await getReportByToken(token);
  if (!report) return <ScorecardMessage locale={locale} title={hu ? "A riport nem található." : "Report not found."} text={hu ? "Lehet, hogy elírták a linket, vagy a riportot törölték. A riportokat 12 hónapig őrizzük meg." : "The link may be mistyped, or the report was deleted. Reports are kept for 12 months."} />;
  const r = translateReport(report.result, report.answers, locale);
  return <ReportView r={r} pdfHref={localizePath(locale, `/scorecard/r/${token}/pdf`)} locale={locale} />;
}
