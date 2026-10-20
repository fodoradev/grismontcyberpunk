import { renderReportPdf } from "../../../../../lib/pdf/ReportDocument";
import { urls } from "../../../../../lib/scorecard/delivery";
import { getReportByToken } from "../../../../../lib/scorecard/store";
import { translateReport } from "../../../../../lib/scorecard/report";
import { getLocale } from "../../../../../lib/i18n-server";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const locale = await getLocale();
  const { token } = await params;
  const report = await getReportByToken(token);
  if (!report) return new Response(locale === "hu" ? "Nem található" : "Not found", { status: 404 });
  const r = translateReport(report.result, report.answers, locale);
  const pdf = await renderReportPdf(r, urls.report(token, locale));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${locale === "hu" ? "Grismont-Folyamatfelmero.pdf" : "Grismont-Discovery-Scorecard.pdf"}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "Referrer-Policy": "no-referrer",
    },
  });
}
