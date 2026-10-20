import { describe, expect, it } from "vitest";
import { quadrantCells, quadrantPoint } from "../../lib/scorecard/chart-geometry";
import { buildReport } from "../../lib/scorecard/report";
import { QUADRANT_SPLIT, computeScores, quadrantFor } from "../../lib/scorecard/scoring";
import { INDUSTRIES, SIZE_BANDS, type Intake, type ReportModel } from "../../lib/scorecard/types";
import { allLevelCombos, randomAnswers, rng, uniformAnswers } from "./fixtures";

const SIZE = 200, R = 9;
// 0.0 … 4.0 in 0.05 steps, plus values hugging the split.
const grid = [...Array.from({ length: 81 }, (_, i) => Math.round(i * 5) / 100), QUADRANT_SPLIT - 0.01, QUADRANT_SPLIT + 0.01];

describe("quadrant geometry", () => {
  it("always draws the dot fully inside the quadrant it is classified in", () => {
    const cells = quadrantCells(SIZE);
    for (const opp of grid) for (const ready of grid) {
      const { x, y } = quadrantPoint(opp, ready, SIZE, R);
      const c = cells[quadrantFor(opp, ready)];
      const where = `opp ${opp}, readiness ${ready} → (${x}, ${y}) in ${quadrantFor(opp, ready)}`;
      expect(x - R, where).toBeGreaterThan(c.x);
      expect(x + R, where).toBeLessThan(c.x + c.w);
      expect(y - R, where).toBeGreaterThan(c.y);
      expect(y + R, where).toBeLessThan(c.y + c.h);
    }
  });

  it("puts higher readiness to the right and higher opportunity higher up", () => {
    for (const fixed of grid) for (let i = 1; i < grid.length - 2; i++) {
      const [a, b] = [grid[i - 1], grid[i]];
      expect(quadrantPoint(fixed, b, SIZE, R).x).toBeGreaterThanOrEqual(quadrantPoint(fixed, a, SIZE, R).x);
      expect(quadrantPoint(b, fixed, SIZE, R).y).toBeLessThanOrEqual(quadrantPoint(a, fixed, SIZE, R).y);
    }
  });

  it("is proportional away from the edges and the split", () => {
    expect(quadrantPoint(1, 3, SIZE, R)).toEqual({ x: 150, y: 150 });
    expect(quadrantPoint(3, 1, SIZE, R)).toEqual({ x: 50, y: 50 });
  });

  it("never puts a score of exactly the split on the dividing line", () => {
    const { x, y } = quadrantPoint(QUADRANT_SPLIT, QUADRANT_SPLIT, SIZE, R);
    expect(quadrantFor(QUADRANT_SPLIT, QUADRANT_SPLIT)).toBe("automate-now");
    expect(x).toBeGreaterThan(SIZE / 2 + R);
    expect(y).toBeLessThan(SIZE / 2 - R);
  });

  it("lays the cells out with opportunity up and readiness right", () => {
    const c = quadrantCells(SIZE);
    expect(c["automate-now"]).toMatchObject({ x: 100, y: 0, top: true });
    expect(c["fix-first"]).toMatchObject({ x: 0, y: 0, top: true });
    expect(c["ready-low-volume"]).toMatchObject({ x: 100, y: 100, top: false });
    expect(c["low-priority"]).toMatchObject({ x: 0, y: 100, top: false });
  });
});

describe("automation readiness cap", () => {
  it("caps readiness at the weaker of stability and data", () => {
    const s = computeScores(uniformAnswers(4, { SS1: "o1", SS2: "o1", SS3: "o1", SS4: "o1", SS5: "o1" }));
    expect(s.readiness).toBe(4);
    expect(s.automationReady).toBe(1);
    expect(s.automationCapped).toBe(true);
  });

  it("moves a high-readiness, unstable company out of 'Automate now'", () => {
    const r = buildReport(uniformAnswers(0, { AP1: "o3", AP2: "o3", AP3: "o3", AP4: "o3", AP5: "o3" }), { firstName: "A", companySize: "11-50", industry: "services" });
    expect(r.automation).toMatchObject({ readinessRaw: 3, readiness: 0, capped: true, quadrant: "fix-first" });
  });
});

describe("the quadrant agrees with the rest of the report", () => {
  const intake = (i: number): Intake => ({ firstName: "A", companySize: SIZE_BANDS[i % 4], industry: INDUSTRIES[Math.floor(i / 4) % 4] });
  const check = (r: ReportModel, label: string) => {
    const { quadrant, opportunity, readiness, readinessRaw, capped } = r.automation;
    const d90 = r.roadmap.d90.map(f => f.id);
    expect(quadrant, label).toBe(quadrantFor(opportunity, readiness));
    expect(capped, label).toBe(readinessRaw > readiness);
    if (quadrant === "automate-now") {
      expect(r.biggestRisk.id, label).not.toBe("risk-automate-chaos");
      expect(r.nextStep.kind, label).not.toBe("fix-first");
      expect(d90, label).not.toContain("rm90-automate-gate");
    }
    if (r.biggestRisk.id === "risk-automate-chaos") expect(quadrant, label).toBe("fix-first");
    if (r.nextStep.kind === "project") expect(quadrant, label).toBe("automate-now");
    if (d90.includes("rm90-automate")) expect(quadrant, label).toBe("automate-now");
    if (d90.includes("rm90-automate-gate")) expect(quadrant, label).toBe("fix-first");
  };

  it("for every combination of area levels", () => {
    let n = 0;
    for (const answers of allLevelCombos()) check(buildReport(answers, intake(n)), `combo ${n++}`);
  });

  it("for random answer sets", () => {
    const rand = rng(99);
    for (let i = 0; i < 3000; i++) check(buildReport(randomAnswers(rand), intake(i)), `random ${i}`);
  });
});
