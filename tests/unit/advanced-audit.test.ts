import { describe, expect, it } from "vitest";
import { ADVANCED_AUDIT_QUESTIONS, AUDIT_SECTIONS } from "../../lib/advanced-audit/questions";
import { computeAdvancedAudit, isAdvancedAuditComplete } from "../../lib/advanced-audit/scoring";
import { buildAdvancedAuditRoadmap } from "../../lib/advanced-audit/roadmap";
import { buildAdvancedAuditReport } from "../../lib/advanced-audit/report";
import { firstOpenAdvancedAuditIndex, validateAdvancedAuditAnswer, validateAdvancedAuditAnswerMap } from "../../lib/advanced-audit/validation";
import { renderAdvancedAuditPdf } from "../../lib/pdf/AdvancedAuditDocument";
import type { AdvancedAuditAnswers } from "../../lib/advanced-audit/types";

describe("Advanced audit questionnaire", () => {
  it("has 44 uniquely identified questions across the nine documented sections", () => {
    expect(ADVANCED_AUDIT_QUESTIONS).toHaveLength(44);
    expect(new Set(ADVANCED_AUDIT_QUESTIONS.map(q => q.id)).size).toBe(44);
    expect(AUDIT_SECTIONS.map(s => s.id)).toEqual(["P","A","B","C","D","E","F","G","H"]);
    for (const q of ADVANCED_AUDIT_QUESTIONS) {
      expect(q.prompt.trim(), q.id).toBeTruthy();
      expect(q.promptHu.trim(), q.id).toBeTruthy();
      if (q.kind === "choice") expect(new Set(q.options.map(o => o.code)).size, q.id).toBe(q.options.length);
    }
  });

  it("validates answers and resumes at the first missing required item", () => {
    expect(validateAdvancedAuditAnswer("P1_process", "  Invoice\nprocessing  ")).toEqual({ok:true,value:"Invoice processing"});
    expect(validateAdvancedAuditAnswer("P1_process", " ")).toEqual({ok:false});
    expect(validateAdvancedAuditAnswer("B2", 5)).toEqual({ok:true,value:5});
    expect(validateAdvancedAuditAnswer("G3", 5)).toEqual({ok:true,value:5});
    expect(validateAdvancedAuditAnswerMap({unknown:1})).toBeUndefined();
    const partial: AdvancedAuditAnswers = {P1_process:"Invoices",P2_category:1};
    expect(firstOpenAdvancedAuditIndex(partial)).toBe(2);
    expect(isAdvancedAuditComplete(partial)).toBe(false);
  });

  it("keeps Don't know as zero points and excludes it from contradictory findings", () => {
    const result=computeAdvancedAudit({B2:5,D1:5,D2:5,D3:5,G3:5});
    expect(result.confidence.dk_count).toBe(5);
    expect(result.confidence.dk_ids).toEqual(["B2","D1","D2","D3","G3"]);
    expect(result.answer_points.B2).toBe(0);
    expect(result.findings.consistency.some(f=>f.id==="X5")).toBe(false);
  });

  it("caps each roadmap horizon at four and classifies automation actions as AUT", () => {
    const answers:AdvancedAuditAnswers={P3_volume:1,G3:0,B2:0};
    const calculated=computeAdvancedAudit(answers);
    const roadmap=buildAdvancedAuditRoadmap(answers,calculated);
    expect(roadmap.roadmap_30.length).toBeLessThanOrEqual(4);
    expect(roadmap.roadmap_60.length).toBeLessThanOrEqual(4);
    expect(roadmap.roadmap_90.length).toBeLessThanOrEqual(4);
    const automationAction=[...roadmap.roadmap_30,...roadmap.roadmap_60,...roadmap.roadmap_90].find(a=>a.id==="ACT-AUT-01");
    if(automationAction) expect(automationAction.dimension).toBe("AUT");
  });

  it("matches the source document's worked scorecard example and renders a Hungarian PDF", async () => {
    const answers:AdvancedAuditAnswers={P1_process:"Example process",P2_category:1,P3_volume:4,P4_effort:2,P5_people:3,P6_systems:3,P7_criticality:4,P8_goal:1,P9_role:1,
      A1:2,A2:1,A3:1,A4:1,B1:2,B2:1,B3:2,B4:1,C1:1,C2:1,C3:1,C4:1,D1:2,D2:1,D3:1,D4:1,E1:1,E2:1,E3:2,E4:2,F1:1,F2:2,F3:0,F4:1,G1:3,G2:3,G3:2,G4:1,G5:2,H1:1,H2:2,H3:1,H4:1};
    const calc=computeAdvancedAudit(answers);
    expect(Object.values(calc.scores.dimensions)).toEqual([31.3,37.5,25,31.3,37.5,25,31.3]);
    expect(calc.scores.PMI_raw).toBe(31.9);
    expect(calc.scores.level_final).toBe(2);
    expect(calc.automation.ARI).toBe(52.5);
    expect(calc.automation.workload_hours).toBe(1000);
    expect(calc.automation.workload_fte).toBe(7.1);
    expect(calc.automation.AOS).toBe(93.8);
    expect(calc.automation.quadrant).toBe("Q2");
    expect(calc.findings.redFlags.map(f=>f.id)).toEqual(["RF6","RF1","RF4","RF3","RF5","RF8"]);
    expect(calc.findings.consistency).toEqual([]);
    expect(calc.waste_top3.map(w=>[w.name,w.score])).toEqual([["Defects",75],["Waiting",75],["Transport",75]]);
    expect(calc.gates.auto).toMatchObject({passes:4,result:"NO-GO"});
    expect(calc.gates.ai).toMatchObject({passes:2,result:"NOT-READY"});
    expect(calc.gates.dmaic).toMatchObject({passes:0,result:"NOT-READY"});
    expect(calc.gates.dashboard).toMatchObject({passes:1,result:"NOT-READY"});
    const report=buildAdvancedAuditReport(answers,{submissionId:"00000000-0000-0000-0000-000000000001",createdAt:new Date("2026-01-01T00:00:00Z"),completedAt:new Date("2026-01-02T00:00:00Z")});
    expect(report.report_id).toBe("PES-20260102-00001");
    expect(report.answers).toHaveLength(44);
    expect(report.projection).toMatchObject({PMI_now:31.9});
    const huReport=buildAdvancedAuditReport(answers,{submissionId:"00000000-0000-0000-0000-000000000002",createdAt:new Date("2026-01-01T00:00:00Z"),completedAt:new Date("2026-01-02T00:00:00Z"),locale:"hu"});
    const pdf=await renderAdvancedAuditPdf(huReport);
    expect(pdf.subarray(0,5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10_000);
  });
});
