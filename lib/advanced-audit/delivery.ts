import { and, eq, lt, ne, sql } from "drizzle-orm";
import { getDb, schema } from "../../db";
import { business } from "../../data/business";
import { advancedAuditResumeEmail } from "../email/templates";
import { deliverEmail } from "../email/send";
import { appUrl } from "../scorecard/delivery";
import { localizePath, type Locale } from "../i18n";

const { advancedAuditSubmissions: submissions, advancedAuditEmailLog: emailLog } = schema;
const MAX_RESUME_EMAIL_ATTEMPTS = 3;

export function advancedAuditResumeUrl(token: string, locale: Locale) {
  return `${appUrl()}${localizePath(locale, `/advanced-audit/s/${token}`)}`;
}

/** Send the first-answer resume link once; failed or interrupted sends remain eligible for the daily retry. */
export async function sendAdvancedAuditResumeEmail(submissionId: string): Promise<"sent" | "skipped" | "failed"> {
  const db = getDb();
  const [claimed] = await db.update(emailLog)
    .set({ attempts: sql`${emailLog.attempts} + 1`, status: "pending", updatedAt: new Date() })
    .where(and(
      eq(emailLog.submissionId, submissionId),
      ne(emailLog.status, "sent"),
      sql`${emailLog.attempts} < ${MAX_RESUME_EMAIL_ATTEMPTS}`,
      sql`(${emailLog.status} = 'failed' or ${emailLog.attempts} = 0 or ${emailLog.updatedAt} < now() - interval '10 minutes')`,
    ))
    .returning({ id: emailLog.id });
  if (!claimed) return "skipped";

  try {
    const [row] = await db.select({ email: submissions.email, resumeToken: submissions.resumeToken, locale: submissions.locale })
      .from(submissions).innerJoin(emailLog, eq(emailLog.submissionId, submissions.id))
      .where(and(eq(submissions.id, submissionId), eq(emailLog.id, claimed.id)));
    if (!row?.email) throw new Error("AUDIT_RESUME_EMAIL_ADDRESS_MISSING");
    const locale = row.locale as Locale;
    const resumeUrl = advancedAuditResumeUrl(row.resumeToken, locale);
    const privacyUrl = `${appUrl()}${localizePath(locale, "/privacy")}`;
    const message = advancedAuditResumeEmail(resumeUrl, privacyUrl, locale);
    const providerId = await deliverEmail({ to: row.email, replyTo: business.email, ...message }, `advanced-audit-resume-${submissionId}`);
    await db.update(emailLog).set({ status: "sent", providerId, lastError: null, updatedAt: new Date() }).where(eq(emailLog.id, claimed.id));
    return "sent";
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error("[advanced-audit-email] resume link delivery failed", { name });
    await db.update(emailLog).set({ status: "failed", lastError: name, updatedAt: new Date() }).where(eq(emailLog.id, claimed.id));
    return "failed";
  }
}

/** Daily retry for queued messages if the request ended before its after-response callback completed. */
export async function retryAdvancedAuditResumeEmails() {
  const db = getDb();
  const pending = await db.select({ submissionId: emailLog.submissionId }).from(emailLog)
    .where(and(ne(emailLog.status, "sent"), lt(emailLog.attempts, MAX_RESUME_EMAIL_ATTEMPTS)));
  let sent = 0;
  let failed = 0;
  for (const { submissionId } of pending) {
    const result = await sendAdvancedAuditResumeEmail(submissionId);
    if (result === "sent") sent++;
    if (result === "failed") failed++;
  }
  return { sent, failed };
}
