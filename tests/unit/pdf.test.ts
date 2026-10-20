import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderReportPdf } from "../../lib/pdf/ReportDocument";
import { buildReport } from "../../lib/scorecard/report";
import { uniformAnswers } from "./fixtures";

describe("renderReportPdf", () => {
  it("renders a multi-page PDF", async () => {
    const r = buildReport(uniformAnswers(1, { AP1: "o4", AP2: "o3", AI1: "o0", AI2: "o0", FT1: "Month-end invoicing: three people re-check the same numbers." }),
      { firstName: "Anna", companySize: "11-50", industry: "services" });
    const pdf = await renderReportPdf(r, "https://example.test/scorecard/r/abc");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10_000);
    if (process.env.PDF_OUT) writeFileSync(process.env.PDF_OUT, pdf);
  }, 30_000);
});
