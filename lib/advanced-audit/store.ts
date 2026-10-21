import { randomBytes } from "node:crypto";
import { and, eq, lt, or, sql } from "drizzle-orm";
import { getDb, schema } from "../../db";
import type { AdvancedAuditAnswers, AdvancedAuditReport, CompleteAdvancedAuditResult } from "./types";

const { advancedAuditSubmissions: submissions, advancedAuditReports: reports } = schema;

/** 128 bits of cryptographic entropy, encoded as a 22-character base64url token. */
export const newAdvancedAuditToken = (): string => randomBytes(16).toString("base64url");

function isAnswerMap(value: unknown): value is AdvancedAuditAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([key, answer]) => key.length > 0 && (
    typeof answer === "string" || (typeof answer === "number" && Number.isFinite(answer))
  ));
}

function isReportObject(value: unknown): value is AdvancedAuditReport {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    return JSON.stringify(value) !== undefined;
  } catch {
    return false;
  }
}

function requireContentVersion(version: string): void {
  if (typeof version !== "string" || version.trim().length === 0) {
    throw new TypeError("Advanced audit content version must be a non-empty string");
  }
}

/** Create an anonymous resumable audit. Keep the returned resume token private. */
export async function createAdvancedAudit(contentVersion: string): Promise<string> {
  requireContentVersion(contentVersion);
  const resumeToken = newAdvancedAuditToken();
  await getDb().insert(submissions).values({ resumeToken, contentVersion });
  return resumeToken;
}

/** Find a saved audit using its bearer resume token. */
export async function getAdvancedAuditByResumeToken(token: string) {
  const [row] = await getDb().select().from(submissions).where(eq(submissions.resumeToken, token));
  return row;
}

/** Atomically merge validated answers; completed audits cannot be changed. */
export async function saveAdvancedAuditAnswers(token: string, answers: AdvancedAuditAnswers): Promise<boolean> {
  if (!isAnswerMap(answers)) throw new TypeError("Answers must be an object of string or finite number values");
  if (Object.keys(answers).length === 0) return false;
  const changed = await getDb().update(submissions).set({
    answers: sql`${submissions.answers} || ${JSON.stringify(answers)}::jsonb`,
    updatedAt: new Date(),
  }).where(and(eq(submissions.resumeToken, token), eq(submissions.status, "in_progress"))).returning({ id: submissions.id });
  return changed.length > 0;
}

/**
 * Freeze the current answer snapshot and save its report in one transaction.
 * Concurrent/repeated completion calls return the one already-created report token.
 */
export async function completeAdvancedAudit(
  token: string,
  buildReport: (submission: { id:string; createdAt:Date; answers:AdvancedAuditAnswers }) => AdvancedAuditReport,
  contentVersion?: string,
): Promise<CompleteAdvancedAuditResult> {
  return getDb().transaction(async tx => {
    const [submission] = await tx.select().from(submissions)
      .where(eq(submissions.resumeToken, token)).for("update");
    if (!submission) return { kind: "not-found" };

    if (submission.status === "completed") {
      const [existing] = await tx.select({ reportToken: reports.reportToken })
        .from(reports).where(eq(reports.submissionId, submission.id));
      if (!existing) throw new Error("Completed advanced audit is missing its report");
      return { kind: "existing", reportToken: existing.reportToken };
    }

    const version = contentVersion ?? submission.contentVersion;
    requireContentVersion(version);
    const report = buildReport({id:submission.id,createdAt:submission.createdAt,answers:submission.answers});
    if (!isReportObject(report)) throw new TypeError("Report must be a JSON-serializable object");
    const reportToken = newAdvancedAuditToken();
    await tx.insert(reports).values({ submissionId: submission.id, reportToken, contentVersion: version, result: report });
    const completedAt = new Date();
    await tx.update(submissions).set({ status: "completed", completedAt, updatedAt: completedAt })
      .where(and(eq(submissions.id, submission.id), eq(submissions.status, "in_progress")));
    return { kind: "created", reportToken };
  });
}

/** Retrieve a stored report by its unguessable report token. */
export async function getAdvancedAuditReportByToken(token: string) {
  const [row] = await getDb().select().from(reports).where(eq(reports.reportToken, token));
  return row;
}

/** Delete unfinished audits after 30 days and completed reports after 12 months. */
export async function purgeExpiredAdvancedAudits(): Promise<number> {
  const removed = await getDb().delete(submissions).where(or(
    and(eq(submissions.status, "in_progress"), lt(submissions.createdAt, sql`now() - interval '30 days'`)),
    and(eq(submissions.status, "completed"), lt(submissions.completedAt, sql`now() - interval '12 months'`)),
  )).returning({ id: submissions.id });
  return removed.length;
}
