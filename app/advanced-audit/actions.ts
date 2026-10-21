"use server";

import { redirect } from "next/navigation";
import { localizePath } from "../../lib/i18n";
import { getLocale } from "../../lib/i18n-server";
import { createAdvancedAudit, completeAdvancedAudit, saveAdvancedAuditAnswers } from "../../lib/advanced-audit/store";
import { AUDIT_CONTENT_VERSION } from "../../lib/advanced-audit/questions";
import { buildAdvancedAuditReport } from "../../lib/advanced-audit/report";
import { isAdvancedAuditComplete } from "../../lib/advanced-audit/scoring";
import { validateAdvancedAuditAnswer } from "../../lib/advanced-audit/validation";

const validToken = (token: unknown): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{22}$/.test(token);
export type AuditActionResult = { ok: true } | { ok: false; message: string };

export async function startAdvancedAuditAction() {
  const locale = await getLocale();
  const token = await createAdvancedAudit(AUDIT_CONTENT_VERSION);
  redirect(localizePath(locale, `/advanced-audit/s/${token}`));
}

export async function saveAdvancedAuditAnswerAction(token: unknown, questionId: unknown, value: unknown): Promise<AuditActionResult> {
  if (!validToken(token)) return { ok:false, message:"This audit link is invalid. Please restart the audit." };
  const answer = validateAdvancedAuditAnswer(questionId, value);
  if (!answer.ok || typeof questionId !== "string") return { ok:false, message:"That answer does not match the question. Please review it and try again." };
  try {
    const saved = await saveAdvancedAuditAnswers(token, { [questionId]: answer.value });
    return saved ? {ok:true} : {ok:false,message:"This audit can no longer be edited. Reload the page or start a new audit."};
  } catch (error) {
    console.error("[advanced-audit] answer save failed", error);
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
    console.error("[advanced-audit] completion failed", error);
    return {ok:false,message:"We couldn't finish your report. Your saved answers are safe; please try again."};
  }
}
