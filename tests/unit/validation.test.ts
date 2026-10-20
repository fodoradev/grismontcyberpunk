import { describe, expect, it } from "vitest";
import { midSentence } from "../../content/scorecard/en/copy";
import { QUESTIONS } from "../../content/scorecard/en/questions";
import { buildReport } from "../../lib/scorecard/report";
import { answeredCount, firstOpenIndex, isComplete, validateAnswer } from "../../lib/scorecard/validation";
import { uniformAnswers } from "./fixtures";

describe("validateAnswer", () => {
  it("accepts known options and rejects anything else", () => {
    expect(validateAnswer("FW1", "o2")).toEqual({ ok: true, value: "o2" });
    expect(validateAnswer("FW2", "approval")).toEqual({ ok: true, value: "approval" });
    expect(validateAnswer("FW1", "o9").ok).toBe(false);
    expect(validateAnswer("XX1", "o1").ok).toBe(false);
    expect(validateAnswer("FW1", 3 as unknown as string).ok).toBe(false);
  });

  it("requires the process name, trims it and caps its length", () => {
    expect(validateAnswer("P1", "   ").ok).toBe(false);
    expect(validateAnswer("P1", "  Customer quotes \u0000 ")).toEqual({ ok: true, value: "Customer quotes" });
    expect((validateAnswer("P1", "x".repeat(500)) as { value: string }).value).toHaveLength(80);
  });

  it("allows the optional free text to be empty", () => {
    expect(validateAnswer("FT1", "")).toEqual({ ok: true, value: "" });
  });
});

describe("progress and completeness", () => {
  it("starts at the process question and counts answers in order", () => {
    expect(firstOpenIndex({})).toBe(0);
    expect(firstOpenIndex({ P1: "Quotes" })).toBe(1);
    expect(answeredCount({ P1: "Quotes", FW1: "o1", FW2: "nonsense" })).toBe(2);
  });

  it("resumes at the first gap, even after later answers", () => {
    const answers = uniformAnswers(2);
    delete answers.SS3;
    expect(QUESTIONS[firstOpenIndex(answers)].id).toBe("SS3");
  });

  it("is complete without the optional free text, but not without the process", () => {
    const answers = uniformAnswers(2);
    expect(isComplete(answers)).toBe(true);
    expect(firstOpenIndex(answers)).toBe(QUESTIONS.length - 1); // only FT1 left to see
    const { P1: _, ...noProcess } = answers;
    expect(isComplete(noProcess)).toBe(false);
  });
});

describe("process in the report", () => {
  it("names the process in the report and in findings", () => {
    const r = buildReport(uniformAnswers(0, { P1: "Month-end invoicing" }), { firstName: "A", companySize: "11-50", industry: "office" });
    expect(r.process).toBe("Month-end invoicing");
    expect(JSON.stringify([r.quickWins, r.roadmap])).toContain("“Month-end invoicing”");
  });

  it("falls back to 'this process' when none is stored", () => {
    const { P1: _, ...answers } = uniformAnswers(0);
    const r = buildReport(answers, { firstName: "A", companySize: "11-50", industry: "office" });
    expect(r.process).toBeUndefined();
    expect(JSON.stringify(r.roadmap)).toContain("this process");
  });
});

describe("midSentence", () => {
  it.each([["Month-end invoicing", "month-end invoicing"], ["customer quotes", "customer quotes"], ["SAP order entry", "SAP order entry"], ["HR onboarding", "HR onboarding"], ["A", "A"]])(
    "%s → %s", (input, out) => expect(midSentence(input)).toBe(out));
});
