import { and, eq, lt, ne } from "drizzle-orm";
import { getDb, schema } from "../../db";
import { QUESTIONS } from "../../content/scorecard/en/questions";
import { MAX_ATTEMPTS, sendOnce } from "../email/send";
import { ownerNotifyEmail, reminderEmail, reportEmail } from "../email/templates";
import { renderReportPdf } from "../pdf/ReportDocument";
import { profileString } from "./scoring";
import { dueForReminders, purgeExpired } from "./store";
import { answeredCount } from "./validation";
import type { Submission } from "../../db/schema";
import { business } from "../../data/business";
import { localizePath, normalizeLocale, type Locale } from "../i18n";

const { submissions, reports, emailLog } = schema;

export function appUrl() {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return (process.env.APP_URL || fromVercel || (process.env.NODE_ENV === "production" ? "https://grismont.hu" : "http://127.0.0.1:3100")).replace(/\/$/, "");
}

export const urls = {
  resume: (token: string, locale: Locale = "en") => `${appUrl()}${localizePath(locale, `/scorecard/s/${token}`)}`,
  report: (token: string, locale: Locale = "en") => `${appUrl()}${localizePath(locale, `/scorecard/r/${token}`)}`,
  delete: (token: string, locale: Locale = "en") => `${appUrl()}${localizePath(locale, `/scorecard/delete/${token}`)}`,
};

/** Emails the PDF report to the submitter and notifies the owner. Safe to call repeatedly. */
export async function sendReportEmails(submissionId: string) {
  const [row] = await getDb().select().from(submissions).innerJoin(reports, eq(reports.submissionId, submissions.id)).where(eq(submissions.id, submissionId));
  if (!row) return;
  const { submissions: s, reports: rep } = row;
  const r = rep.result;
  const locale = normalizeLocale(r.locale);
  const reportUrl = urls.report(rep.reportToken, locale);

  await sendOnce(s.id, "report", async () => ({
    to: s.email,
    replyTo: process.env.OWNER_NOTIFY_EMAIL || business.email,
    ...reportEmail(r, { report: reportUrl, delete: urls.delete(s.resumeToken, locale) }),
    attachments: [{ filename: "Grismont-Discovery-Scorecard.pdf", content: await renderReportPdf(r, reportUrl) }],
  }));

  const owner = process.env.OWNER_NOTIFY_EMAIL;
  if (owner) {
    await sendOnce(s.id, "owner_notify", async () => ({
      to: owner,
      replyTo: s.email,
      ...ownerNotifyEmail(r, { email: s.email, role: s.role, companyName: s.companyName, profile: profileString(r), reportUrl }),
    }));
  }
}

async function sendReminder(s: Submission, reminderNumber: number, reminderKind: "reminder_1" | "reminder_3" | "reminder_5") {
  const locale = normalizeLocale(s.locale);
  return sendOnce(s.id, reminderKind, async () => ({
    to: s.email,
    ...reminderEmail(s.firstName, answeredCount(s.answers), QUESTIONS.length, { resume: urls.resume(s.resumeToken, locale), delete: urls.delete(s.resumeToken, locale) }, locale, reminderNumber),
  }));
}

/** Daily job: schedule three inactivity reminders, retry report emails, enforce retention. */
export async function runDaily() {
  const reminders = { sent: 0, failed: 0 };
  for (const { submission, reminderNumber, reminderKind } of await dueForReminders()) {
    const r = await sendReminder(submission, reminderNumber, reminderKind);
    if (r === "sent") reminders.sent++;
    if (r === "failed") reminders.failed++;
  }

  // Coarse filter only: sendOnce() decides atomically whether each email may be sent now.
  const unsent = await getDb().selectDistinct({ id: emailLog.submissionId }).from(emailLog)
    .where(and(ne(emailLog.kind, "reminder"), ne(emailLog.status, "sent"), lt(emailLog.attempts, MAX_ATTEMPTS)));
  for (const { id } of unsent) await sendReportEmails(id);

  const purged = await purgeExpired();
  return { reminders, retried: unsent.length, purged };
}
