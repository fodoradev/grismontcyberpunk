import { describe, expect, it } from "vitest";
import { buildReport } from "../../lib/scorecard/report";
import { computeScores, levelFor, profileString, quadrantFor } from "../../lib/scorecard/scoring";
import { uniformAnswers } from "./fixtures";

describe("computeScores", () => {
  it("averages each area on 0–4", () => {
    const s = computeScores(uniformAnswers(3));
    expect(s.FW).toBe(3);
    expect(s.SS).toBe(3);
    expect(s.PO).toBe(3);
  });

  it("splits automation into opportunity and readiness", () => {
    const s = computeScores(uniformAnswers(1, { AP1: "o4", AP2: "o4" }));
    expect(s.opportunity).toBe(4);
    expect(s.readiness).toBe(1);
    expect(s.AP).toBe(1);
  });

  it("caps AI readiness at one level above the weaker of stability and data", () => {
    const answers = uniformAnswers(4, { SS1: "o0", SS2: "o0", SS3: "o0", SS4: "o0", SS5: "o0" });
    const s = computeScores(answers);
    expect(s.foundation).toBe(0);
    expect(s.aiRaw).toBe(4);
    expect(s.AI).toBe(1);
    expect(s.aiCapped).toBe(true);
  });

  it("does not cap when foundations support the AI score", () => {
    const s = computeScores(uniformAnswers(3));
    expect(s.AI).toBe(3);
    expect(s.aiCapped).toBe(false);
  });

  it("treats unanswered questions as 0", () => {
    expect(computeScores({}).FW).toBe(0);
  });
});

describe("levels and quadrants", () => {
  it.each([[0, "Ad hoc"], [1.9, "Person-dependent"], [2, "Documented"], [3.4, "Managed"], [3.5, "Improving"]] as const)(
    "score %s is %s", (score, level) => expect(levelFor(score)).toBe(level));

  it("places opportunity × readiness", () => {
    expect(quadrantFor(3, 3)).toBe("automate-now");
    expect(quadrantFor(3, 1)).toBe("fix-first");
    expect(quadrantFor(1, 3)).toBe("ready-low-volume");
    expect(quadrantFor(1, 1)).toBe("low-priority");
  });

  it("formats a compact profile, showing the raw AI score when capped", () => {
    const r = buildReport(uniformAnswers(4, { DM1: "o0", DM2: "o0", DM3: "o0", DM4: "o0", DM5: "o0" }), { firstName: "A", companySize: "1-10", industry: "other" });
    expect(profileString(r)).toContain("AI 1.0 (raw 4.0)");
  });
});
