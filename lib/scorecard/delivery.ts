import { and, eq, lt, ne } from "drizzle-orm";
import { getDb, schema } from "../../db";
import { QUESTIONS } from "../../content/scorecard/en/questions";
import { MAX_ATTEMPTS, sendOnce } from "../email/send";
import { followUpEmail, ownerNotifyEmail, reminderEmail, reportEmail } from "../email/templates";
import { nextFollowUp } from "./followups";
import { renderReportPdf } from "../pdf/ReportDocument";
import { profileString } from "./scoring";
import { dueForReminders, followUpCandidates, purgeExpired } from "./store";
import { answeredCount } from "./validation";
import type { Submission } from "../../db/schema";
import { business } from "../../data/business";
import { known, site } from "../../data/site";
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
  audit: (locale: Locale = "en") => `${appUrl()}${localizePath(locale, "/advanced-audit")}`,
  unsubscribe: (token: string, locale: Locale = "en") => `${appUrl()}${localizePath(locale, `/scorecard/unsubscribe/${token}`)}`,
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
    ...reportEmail(r, { report: reportUrl, delete: urls.delete(s.resumeToken, locale), audit: urls.audit(locale), booking: known(site.bookingUrl) }),
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

/** Sends the next due follow-up (04 §3) to everyone who opted in; at most one per person per run. */
async function sendFollowUps() {
  const counts = { sent: 0, failed: 0 };
  for (const { submission: s, report, sent } of await followUpCandidates()) {
    const locale = normalizeLocale(report.result.locale);
    const caseStudy = site.caseStudies[locale][0];
    const stage = nextFollowUp(s.completedAt!, sent, Boolean(caseStudy));
    if (!stage) continue;
    const result = await sendOnce(s.id, stage.kind, async () => ({
      to: s.email,
      replyTo: process.env.OWNER_NOTIFY_EMAIL || business.email,
      ...followUpEmail(stage.kind, report.result,
        { report: urls.report(report.reportToken, locale), unsubscribe: urls.unsubscribe(s.resumeToken, locale), booking: known(site.bookingUrl) },
        caseStudy && { ...caseStudy, url: caseStudy.slug ? `${appUrl()}${localizePath(locale, `/work/case-studies/${caseStudy.slug}`)}` : undefined }),
    }));
    if (result === "sent") counts.sent++;
    if (result === "failed") counts.failed++;
  }
  return counts;
}

/** Daily job: schedule three inactivity reminders, send opted-in follow-ups, retry report emails, enforce retention. */
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

  const followUps = await sendFollowUps();
  const purged = await purgeExpired();
  return { reminders, followUps, retried: unsent.length, purged };
}
