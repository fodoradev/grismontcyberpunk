import { describe, expect, it } from "vitest";
import { nextReminderStage } from "../../lib/scorecard/reminders";

const day = 24 * 60 * 60 * 1000;
const start = new Date("2026-01-01T00:00:00Z");

describe("inactivity reminder schedule", () => {
  it("waits one day before the first reminder", () => {
    expect(nextReminderStage(start, new Set(), start.getTime() + day - 1)).toBeNull();
    expect(nextReminderStage(start, new Set(), start.getTime() + day)).toEqual({ kind: "reminder_1", afterDays: 1 });
  });

  it("sends the next stage at three and five idle days", () => {
    expect(nextReminderStage(start, new Set(["reminder_1"]), start.getTime() + 3 * day)).toEqual({ kind: "reminder_3", afterDays: 3 });
    expect(nextReminderStage(start, new Set(["reminder_1", "reminder_3"]), start.getTime() + 5 * day)).toEqual({ kind: "reminder_5", afterDays: 5 });
  });

  it("restarts the wait after activity and stops once all stages are sent", () => {
    const resumedAt = new Date(start.getTime() + 2 * day);
    expect(nextReminderStage(resumedAt, new Set(["reminder_1"]), resumedAt.getTime() + day)).toBeNull();
    expect(nextReminderStage(resumedAt, new Set(["reminder_1"]), resumedAt.getTime() + 3 * day)).toEqual({ kind: "reminder_3", afterDays: 3 });
    expect(nextReminderStage(start, new Set(["reminder_1", "reminder_3", "reminder_5"]), start.getTime() + 10 * day)).toBeNull();
  });
});
