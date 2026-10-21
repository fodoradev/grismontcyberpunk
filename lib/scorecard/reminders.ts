export const REMINDER_STAGES = [
  { kind: "reminder_1", afterDays: 1 },
  { kind: "reminder_3", afterDays: 3 },
  { kind: "reminder_5", afterDays: 5 },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns the next unsent reminder once the submission has been idle long enough. */
export function nextReminderStage(updatedAt: Date, sentKinds: ReadonlySet<string>, now = Date.now()) {
  const stage = REMINDER_STAGES.find(({ kind }) => !sentKinds.has(kind));
  if (!stage || updatedAt.getTime() + stage.afterDays * DAY_MS > now) return null;
  return stage;
}
