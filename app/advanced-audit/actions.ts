"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { localizePath } from "../../lib/i18n";
import { getLocale } from "../../lib/i18n-server";
import { createAdvancedAudit, completeAdvancedAudit, saveAdvancedAuditAnswers } from "../../lib/advanced-audit/store";
import { AUDIT_CONTENT_VERSION } from "../../lib/advanced-audit/questions";
import { buildAdvancedAuditReport } from "../../lib/advanced-audit/report";
import { isAdvancedAuditComplete } from "../../lib/advanced-audit/scoring";
import { validateAdvancedAuditAnswer } from "../../lib/advanced-audit/validation";
import { sendAdvancedAuditResumeEmail } from "../../lib/advanced-audit/delivery";

const validToken = (token: unknown): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{22}$/.test(token);
export type AuditActionResult = { ok: true; resumeEmailPending?: boolean } | { ok: false; message: string };
export type AdvancedAuditStartState = { email?: string; resumeEmail?: boolean; errors?: { email?: string; consent?: string }; message?: string };

function logAdvancedAuditFailure(action: string, error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  const code = typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
  // Database errors can contain query parameters, including bearer resume tokens.
  console.error(`[advanced-audit] ${action} failed`, { name, code });
}

export async function startAdvancedAuditAction(_previous: AdvancedAuditStartState, formData: FormData): Promise<AdvancedAuditStartState> {
  const locale = await getLocale();
  const hu = locale === "hu";
  const rawEmail = String(formData.get("email") ?? "");
  // Two separate checkboxes (04 §4): the privacy notice is required; the resume-link email is optional.
  const resumeEmail = formData.get("resumeEmail") === "on";
  const email = z.string().trim().toLowerCase().max(254).pipe(z.email()).safeParse(rawEmail);
  const errors: NonNullable<AdvancedAuditStartState["errors"]> = {};
  if (resumeEmail && !email.success) errors.email = hu ? "A hivatkozás elküldéséhez adj meg egy érvényes e-mail-címet." : "Please enter a valid email address for the link.";
  if (formData.get("consent") !== "on") errors.consent = hu ? "Kérlek, erősítsd meg, hogy elolvastad az adatkezelési tájékoztatót." : "Please confirm you've read the privacy notice.";
  if (String(formData.get("website") ?? "")) return { message: hu ? "Valami nem sikerült. Próbáld újra." : "Something went wrong. Please try again." };
  if (Object.keys(errors).length) return { email: rawEmail, resumeEmail, errors };

  let token: string;
  try {
    token = await createAdvancedAudit(AUDIT_CONTENT_VERSION, resumeEmail && email.success ? email.data : null, locale);
  } catch (error) {
    logAdvancedAuditFailure("start", error);
    return { email: rawEmail, resumeEmail, message: hu ? "Most nem sikerült elindítani az auditot. Kérlek, próbáld újra később." : "We couldn't start the audit just now. Please try again in a moment." };
  }
  redirect(localizePath(locale, `/advanced-audit/s/${token}`));
}

export async function saveAdvancedAuditAnswerAction(token: unknown, questionId: unknown, value: unknown): Promise<AuditActionResult> {
  const locale = await getLocale();
  if (!validToken(token)) return { ok:false, message:"This audit link is invalid. Please restart the audit." };
  const answer = validateAdvancedAuditAnswer(questionId, value);
  if (!answer.ok || typeof questionId !== "string") return { ok:false, message:"That answer does not match the question. Please review it and try again." };
  try {
    const saved = await saveAdvancedAuditAnswers(token, { [questionId]: answer.value }, locale);
    if (saved.resumeEmailPending && saved.submissionId) after(async () => {
      try { await sendAdvancedAuditResumeEmail(saved.submissionId!); }
      catch (error) { logAdvancedAuditFailure("resume email", error); }
    });
    return saved.saved ? {ok:true,resumeEmailPending:saved.resumeEmailPending} : {ok:false,message:"This audit can no longer be edited. Reload the page or start a new audit."};
  } catch (error) {
    logAdvancedAuditFailure("answer save", error);
    return {ok:false,message:"We couldn't save that answer. Check your connection and try again."};
  }
}

export async function completeAdvancedAuditAction(token: unknown): Promise<AuditActionResult> {
  const locale = await getLocale();
  if (!validToken(token)) return {ok:false,message:"This audit link is invalid. Please restart the audit."};
  try {
    const completed = await completeAdvancedAudit(token, submission => {
      if (!isAdvancedAuditComplete(submission.answers)) throw new Error("ADVANCED_AUDIT_INCOMPLETE");
      return buildAdvancedAuditReport(submission.answers, { submissionId:submission.id, createdAt:submission.createdAt, locale });
    }, AUDIT_CONTENT_VERSION);
    if (completed.kind === "not-found") return {ok:false,message:"This audit link is no longer active."};
    redirect(localizePath(locale, `/advanced-audit/r/${completed.reportToken}`));
  } catch (error) {
    // Next.js redirect is framework control flow and must not be swallowed.
    if (error instanceof Error && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof Error && error.message === "ADVANCED_AUDIT_INCOMPLETE") return {ok:false,message:"A few required answers are missing. Go back to the first unanswered question."};
    logAdvancedAuditFailure("completion", error);
    return {ok:false,message:"We couldn't finish your report. Your saved answers are safe; please try again."};
  }
}
