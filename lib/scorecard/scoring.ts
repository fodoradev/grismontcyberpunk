import { QUESTIONS } from "../../content/scorecard/en/questions";
import { AREAS, type AreaId, type Answers, type Level, type Quadrant, type ReportModel, type Scores, type ScoredQuestion } from "./types";

const round1 = (n: number) => Math.round(n * 10) / 10;
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

const scoredQuestions = QUESTIONS.filter((q): q is ScoredQuestion => q.kind === "scored");

/** 0–4 score of one answered scored question; undefined if unanswered or not scored. */
export function answerScore(questionId: string, answers: Answers): number | undefined {
  const q = scoredQuestions.find(x => x.id === questionId);
  return q?.options.find(o => o.id === answers[questionId])?.score;
}

function meanOf(filter: (q: ScoredQuestion) => boolean, answers: Answers) {
  return round1(mean(scoredQuestions.filter(filter).map(q => answerScore(q.id, answers) ?? 0)));
}

export function computeScores(answers: Answers): Scores {
  const raw = Object.fromEntries(
    AREAS.map(area => [area, meanOf(q => q.area === area && q.sub !== "opportunity", answers)])
  ) as Record<AreaId, number>;
  const opportunity = meanOf(q => q.sub === "opportunity", answers);
  const foundation = Math.min(raw.SS, raw.DM);
  // Process foundations cap AI readiness: AI on an unstable process or untrusted data is faster chaos.
  const aiCap = round1(foundation + 1);
  const aiRaw = raw.AI;
  // The same principle caps automation readiness, without the +1: automation copies a process exactly, errors included.
  const automationReady = Math.min(raw.AP, foundation);
  return {
    ...raw, AI: Math.min(aiRaw, aiCap), aiRaw, aiCapped: aiRaw > aiCap,
    opportunity, readiness: raw.AP, automationReady, automationCapped: raw.AP > automationReady, foundation,
  };
}

export function levelFor(score: number): Level {
  if (score < 1) return "Ad hoc";
  if (score < 2) return "Person-dependent";
  if (score < 2.75) return "Documented";
  if (score < 3.5) return "Managed";
  return "Improving";
}

/** Scores at or above this (on 0–4) count as "high" on both quadrant axes. */
export const QUADRANT_SPLIT = 2;

export function quadrantFor(opportunity: number, readiness: number): Quadrant {
  const highOpp = opportunity >= QUADRANT_SPLIT, ready = readiness >= QUADRANT_SPLIT;
  if (highOpp && ready) return "automate-now";
  if (highOpp) return "fix-first";
  if (ready) return "ready-low-volume";
  return "low-priority";
}

/** Compact profile for the owner notification, e.g. "FW 1.8 · SS 1.2 · … · AI 2.2 (raw 3.0)". */
export function profileString(r: ReportModel): string {
  return AREAS.map(a => {
    if (a === "AP") return `AP ${r.automation.readiness.toFixed(1)} ready / ${r.automation.opportunity.toFixed(1)} opp.`;
    if (a === "AI" && r.ai.capped) return `AI ${r.ai.shown.toFixed(1)} (raw ${r.ai.raw.toFixed(1)})`;
    return `${a} ${r.areas[a].score.toFixed(1)}`;
  }).join(" · ");
}
