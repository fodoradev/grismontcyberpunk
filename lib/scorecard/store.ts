import { randomBytes } from "node:crypto";
import { and, eq, gt, inArray, lt, or, sql } from "drizzle-orm";
import { getDb, schema } from "../../db";
import { buildReport, translateReport } from "./report";
import { normalizeLocale, type Locale } from "../i18n";
import { isComplete, type IntakeInput } from "./validation";
import { nextReminderStage } from "./reminders";
import type { Answers, Intake, SizeBand, Industry } from "./types";

const { submissions, reports } = schema;
export const newToken = () => randomBytes(16).toString("base64url");

const intakesPerIpPerHour = () => Number(process.env.SCORECARD_INTAKES_PER_HOUR) || 5;
export class RateLimitedError extends Error {}

export async function startSubmission(input: IntakeInput, ipHash: string | null, locale: Locale = "en"): Promise<string> {
  const db = getDb();
  if (ipHash) {
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(submissions)
      .where(and(eq(submissions.ipHash, ipHash), gt(submissions.createdAt, sql`now() - interval '1 hour'`)));
    if (n >= intakesPerIpPerHour()) throw new RateLimitedError();
  }
  const resumeToken = newToken();
  await db.transaction(async tx => {
    // A fresh start replaces any unfinished attempt for this email, so only the latest one gets a reminder.
    await tx.update(submissions).set({ status: "superseded", updatedAt: new Date() })
      .where(and(eq(submissions.email, input.email), eq(submissions.status, "in_progress")));
    await tx.insert(submissions).values({
      resumeToken, firstName: input.firstName, email: input.email, companySize: input.companySize, industry: input.industry,
      companyName: input.companyName, role: input.role, consentAt: new Date(), ipHash, locale,
    });
  });
  return resumeToken;
}

export async function getByResumeToken(token: string) {
  const [row] = await getDb().select().from(submissions).where(eq(submissions.resumeToken, token));
  return row;
}

export async function getReportByToken(token: string) {
  const [row] = await getDb().select().from(reports).innerJoin(submissions, eq(reports.submissionId, submissions.id)).where(eq(reports.reportToken, token));
  return row ? { ...row.reports, answers: row.submissions.answers } : undefined;
}

export async function setSubmissionLocale(token: string, locale: Locale): Promise<boolean> {
  const rows = await getDb().update(submissions).set({ locale, updatedAt: new Date() }).where(and(eq(submissions.resumeToken, token), eq(submissions.status, "in_progress"))).returning({ id: submissions.id });
  return rows.length > 0;
}

export async function getReportTokenFor(submissionId: string) {
  const [row] = await getDb().select({ reportToken: reports.reportToken }).from(reports).where(eq(reports.submissionId, submissionId));
  return row?.reportToken;
}

/** Merges one validated answer. Returns false if the submission is no longer editable. */
export async function saveAnswer(token: string, questionId: string, value: string): Promise<boolean> {
  const updated = await getDb().update(submissions).set({
    answers: sql`${submissions.answers} || ${JSON.stringify({ [questionId]: value } satisfies Answers)}::jsonb`,
    updatedAt: new Date(),
  }).where(and(eq(submissions.resumeToken, token), eq(submissions.status, "in_progress"))).returning({ id: submissions.id });
  return updated.length > 0;
}

export const intakeOf = (s: { firstName: string; companySize: string; industry: string; companyName: string | null }): Intake => ({
  firstName: s.firstName, companySize: s.companySize as SizeBand, industry: s.industry as Industry, ...(s.companyName ? { companyName: s.companyName } : {}),
});

type Done = { submissionId: string; reportToken: string };
export type SubmitResult = (Done & { kind: "created" }) | (Done & { kind: "existing" }) | { kind: "incomplete" } | { kind: "not-found" };

/** Scores, snapshots and completes a submission exactly once; repeated calls return the existing report. */
export async function submit(token: string, locale?: Locale): Promise<SubmitResult> {
  return getDb().transaction(async tx => {
    const [s] = await tx.select().from(submissions).where(eq(submissions.resumeToken, token)).for("update");
    if (!s || s.status === "superseded") return { kind: "not-found" };
    if (s.status === "completed") {
      const [r] = await tx.select({ reportToken: reports.reportToken }).from(reports).where(eq(reports.submissionId, s.id));
      return { kind: "existing", submissionId: s.id, reportToken: r.reportToken };
    }
    if (!isComplete(s.answers)) return { kind: "incomplete" };
    const en = buildReport(s.answers, intakeOf(s));
    const hu = translateReport(en, s.answers, "hu");
    const reportLocale = locale ?? normalizeLocale(s.locale);
    const result = { ...(reportLocale === "hu" ? hu : en), translations: { en, hu } };
    const reportToken = newToken();
    await tx.insert(reports).values({ submissionId: s.id, reportToken, contentVersion: result.contentVersion, result });
    await tx.update(submissions).set({ status: "completed", completedAt: new Date(), updatedAt: new Date(), locale: reportLocale }).where(eq(submissions.id, s.id));
    // Recorded in the same transaction, so the daily job retries the email even if the post-response send never runs.
    await tx.insert(schema.emailLog).values({ submissionId: s.id, kind: "report" });
    return { kind: "created", submissionId: s.id, reportToken };
  });
}

export async function deleteByResumeToken(token: string): Promise<boolean> {
  const deleted = await getDb().delete(submissions).where(eq(submissions.resumeToken, token)).returning({ id: submissions.id });
  return deleted.length > 0;
}

/** One next reminder per unfinished submission, measured from the last saved activity. */
export async function dueForReminders() {
  const db = getDb();
  const candidates = await db.select().from(submissions).where(and(
    eq(submissions.status, "in_progress"),
    lt(submissions.updatedAt, sql`now() - interval '1 day'`),
    gt(submissions.createdAt, sql`now() - interval '30 days'`),
  ));
  if (candidates.length === 0) return [];

  const logs = await db.select({ submissionId: schema.emailLog.submissionId, kind: schema.emailLog.kind, status: schema.emailLog.status })
    .from(schema.emailLog).where(inArray(schema.emailLog.submissionId, candidates.map(s => s.id)));
  const sentBySubmission = new Map<string, Set<string>>();
  for (const log of logs) {
    if (log.status !== "sent") continue;
    const kinds = sentBySubmission.get(log.submissionId) ?? new Set<string>();
    kinds.add(log.kind);
    // Preserve the old single-reminder state after deploying the new staged schedule.
    if (log.kind === "reminder") kinds.add("reminder_1");
    sentBySubmission.set(log.submissionId, kinds);
  }
  for (const submission of candidates) {
    if (submission.reminderSentAt) {
      const kinds = sentBySubmission.get(submission.id) ?? new Set<string>();
      kinds.add("reminder_1");
      sentBySubmission.set(submission.id, kinds);
    }
  }
  return candidates.flatMap(submission => {
    const stage = nextReminderStage(submission.updatedAt, sentBySubmission.get(submission.id) ?? new Set());
    return stage ? [{ submission, reminderNumber: stage.afterDays, reminderKind: stage.kind }] : [];
  });
}

/** Retention: unfinished after 30 days, completed after 12 months. Returns the number of deleted submissions. */
export async function purgeExpired(): Promise<number> {
  const deleted = await getDb().delete(submissions).where(or(
    and(inArray(submissions.status, ["in_progress", "superseded"]), lt(submissions.createdAt, sql`now() - interval '30 days'`)),
    and(eq(submissions.status, "completed"), lt(submissions.completedAt, sql`now() - interval '12 months'`)),
  )).returning({ id: submissions.id });
  return deleted.length;
}
