/**
 * Marketing follow-ups after the report (04 §3), only with the separate step-3 consent. Each stage is sent at most
 * once, inside a three-day window after its target day, so a late consent or a missed cron run never sends stale
 * mail, and the day-5 case study ([PROOF]) simply starts going out once one exists.
 */
export const FOLLOW_UP_STAGES = [
  { kind: "followup_2", afterDays: 2 },
  { kind: "followup_5", afterDays: 5, needsCaseStudy: true },
  { kind: "followup_9", afterDays: 9 },
] as const;

export type FollowUpKind = (typeof FOLLOW_UP_STAGES)[number]["kind"];

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 3;

export function nextFollowUp(completedAt: Date, sentKinds: ReadonlySet<string>, hasCaseStudy: boolean, now = Date.now()) {
  const age = now - completedAt.getTime();
  return FOLLOW_UP_STAGES.find(stage =>
    !sentKinds.has(stage.kind)
    && (!("needsCaseStudy" in stage) || hasCaseStudy)
    && age >= stage.afterDays * DAY_MS && age < (stage.afterDays + WINDOW_DAYS) * DAY_MS) ?? null;
}
