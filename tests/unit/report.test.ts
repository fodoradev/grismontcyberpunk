import { describe, expect, it } from "vitest";
import { QUESTIONS, QUESTION_BY_ID } from "../../content/scorecard/en/questions";
import { FINDINGS } from "../../content/scorecard/en/findings";
import { buildReport } from "../../lib/scorecard/report";
import { AREAS, INDUSTRIES, SIZE_BANDS, type Answers, type Intake, type ReportModel } from "../../lib/scorecard/types";
import { allLevelCombos, randomAnswers, rng, uniformAnswers } from "./fixtures";

const intake = (i = 0): Intake => ({ firstName: "Anna", companySize: SIZE_BANDS[i % 4], industry: INDUSTRIES[Math.floor(i / 4) % 4] });

function expectComplete(r: ReportModel, label: string) {
  const ctx = `${label}: ${JSON.stringify(r.areas, (k, v) => (k === "note" ? undefined : v))}`;
  expect(r.quickWins, ctx).toHaveLength(3);
  expect(new Set(r.quickWins.map(f => f.area)).size, ctx).toBe(3);
  expect(r.biggestRisk, ctx).toBeDefined();
  for (const col of [r.roadmap.d30, r.roadmap.d60, r.roadmap.d90]) expect(col.length, ctx).toBeGreaterThanOrEqual(2);
  for (const a of AREAS) expect(r.areas[a].note, ctx).toBeDefined();
  expect(r.nextStep.text.title, ctx).toBeTruthy();
  const text = JSON.stringify([r.quickWins, r.biggestRisk, r.roadmap, r.nextStep, r.areas]);
  expect(text, ctx).not.toMatch(/\{[A-Za-z0-9.]+\}/); // no unresolved placeholders
  expect(text, ctx).not.toContain("not answered");
}

describe("buildReport coverage", () => {
  it("produces a complete report for every combination of area levels", () => {
    let n = 0;
    for (const answers of allLevelCombos()) expectComplete(buildReport(answers, intake(n)), `combo ${n++}`);
    expect(n).toBe(15625);
  });

  it("produces a complete report for random answer sets", () => {
    const rand = rng(42);
    for (let i = 0; i < 3000; i++) expectComplete(buildReport(randomAnswers(rand), intake(i)), `random ${i}`);
  });
});

describe("buildReport behaviour", () => {
  it("leads with the shadow-AI risk when people use free tools without a rule", () => {
    const r = buildReport(uniformAnswers(3, { AI1: "o0", AI2: "o0" }), intake());
    expect(r.biggestRisk.id).toBe("risk-shadow-ai");
    expect(r.biggestRisk.observed).toContain("No; people use what they like");
  });

  it("warns against automating chaos", () => {
    const r = buildReport(uniformAnswers(1, { AP1: "o4", AP2: "o4", AI1: "o3", SS3: "o2", PO5: "o2" }), intake());
    expect(r.biggestRisk.id).toBe("risk-automate-chaos");
    expect(r.nextStep.kind).toBe("fix-first");
  });

  it("only recommends an AI pilot when foundations are in place", () => {
    const weak = buildReport(uniformAnswers(1), intake());
    expect(weak.roadmap.d90.map(f => f.id)).not.toContain("rm90-ai-pilot");
    const strong = buildReport(uniformAnswers(3), intake());
    expect(strong.roadmap.d90.map(f => f.id)).toContain("rm90-ai-pilot");
  });

  it("recommends a project for high opportunity on solid foundations", () => {
    const r = buildReport(uniformAnswers(3, { AP1: "o4", AP2: "o4" }), intake());
    expect(r.nextStep.kind).toBe("project");
  });

  it("applies size variants", () => {
    const weakOwnership = { PO1: "o1", PO2: "o1", PO3: "o1", PO4: "o1", PO5: "o2" };
    const small = buildReport(uniformAnswers(3, weakOwnership), { ...intake(), companySize: "1-10" });
    expect(small.nextStep.kind).toBe("training");
    expect(small.nextStep.text.action).toContain("Skip formal certificates");
    const large = buildReport(uniformAnswers(3, weakOwnership), { ...intake(), companySize: "250+" });
    expect(large.nextStep.text.action).toContain("Lean Six Sigma training");
  });

  it("keeps the free text and omits it when blank", () => {
    expect(buildReport(uniformAnswers(2, { FT1: "  Invoicing  " }), intake()).freeText).toBe("Invoicing");
    expect(buildReport(uniformAnswers(2, { FT1: "  " }), intake()).freeText).toBeUndefined();
  });
});

describe("findings library lint", () => {
  it("has unique ids", () => {
    const ids = FINDINGS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses known placeholders", () => {
    const scoreKeys = [...AREAS, "aiRaw", "opportunity", "readiness", "foundation"];
    for (const f of FINDINGS) {
      const variants = [f.text, ...Object.values(f.bySize ?? {}), ...Object.values(f.byIndustry ?? {})];
      for (const v of variants) for (const s of Object.values(v ?? {})) {
        for (const [, key] of (s as string).matchAll(/\{([A-Za-z0-9.]+)\}/g)) {
          const ok = key === "weakest" || key === "lowest" || key === "process" || QUESTION_BY_ID.has(key) || (key.startsWith("score.") && scoreKeys.includes(key.slice(6)));
          expect(ok, `${f.id}: {${key}}`).toBe(true);
        }
      }
    }
  });

  it("fills every field that the report shows", () => {
    for (const f of FINDINGS) {
      expect(f.text.title, f.id).toBeTruthy();
      expect(f.text.action, f.id).toBeTruthy();
      if (f.kind === "quickWin" || f.kind === "risk") for (const k of ["observed", "why", "done"] as const) expect(f.text[k], `${f.id}.${k}`).toBeTruthy();
      if (f.kind === "roadmap") expect(f.text.done, f.id).toBeTruthy();
    }
  });

  it("ends next-step rules with a catch-all", () => {
    const steps = FINDINGS.filter(f => f.kind === "nextStep");
    expect(steps.at(-1)!.when({} as never)).toBe(true);
  });
});

describe("no repetition", () => {
  it("never repeats the biggest risk's area in the quick wins", () => {
    const rand = rng(7);
    for (let i = 0; i < 500; i++) {
      const r = buildReport(randomAnswers(rand), intake(i));
      expect(r.quickWins.map(f => f.area)).not.toContain(r.biggestRisk.area);
    }
  });
});
