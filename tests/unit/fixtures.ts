import { QUESTIONS } from "../../content/scorecard/en/questions";
import type { Answers } from "../../lib/scorecard/types";

/** Every scored and diag question answered with option index `i` (clamped to the option count). */
export function uniformAnswers(i: number, overrides: Answers = {}): Answers {
  const a: Answers = {};
  for (const q of QUESTIONS) if (q.kind !== "text") a[q.id] = q.options[Math.min(i, q.options.length - 1)].id;
  return { P1: "Customer quotes", ...a, ...overrides };
}

/** Deterministic PRNG so failures are reproducible. */
export function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

/** Every combination of 0–4 levels across the six areas (15,625 answer sets), with opportunity varied independently. */
export function* allLevelCombos(): Generator<Answers> {
  const levels = [0, 1, 2, 3, 4];
  for (const FW of levels) for (const SS of levels) for (const DM of levels)
    for (const AP of levels) for (const AI of levels) for (const PO of levels) {
      const byArea = { FW, SS, DM, AP, AI, PO };
      const a: Answers = {};
      for (const q of QUESTIONS) if (q.kind !== "text") a[q.id] = q.options[Math.min(byArea[q.area], q.options.length - 1)].id;
      a.AP1 = a.AP2 = `o${(FW + SS + PO) % 5}`;
      a.P1 = "Customer quotes";
      yield a;
    }
}

/** Random answers for every scored and diag question. */
export function randomAnswers(rand: () => number): Answers {
  const a: Answers = {};
  for (const q of QUESTIONS) if (q.kind !== "text") a[q.id] = q.options[Math.floor(rand() * q.options.length)].id;
  if (rand() < 0.8) a.P1 = "Month-end invoicing"; // sometimes missing, to exercise the "this process" fallback
  return a;
}
