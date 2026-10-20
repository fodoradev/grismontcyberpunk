"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { sendReportEmails } from "../../lib/scorecard/delivery";
import { RateLimitedError, deleteByResumeToken, saveAnswer, startSubmission, submit, setSubmissionLocale } from "../../lib/scorecard/store";
import { getIntakeSchema, validateAnswer } from "../../lib/scorecard/validation";
import { getLocale } from "../../lib/i18n-server";
import { localizePath } from "../../lib/i18n";

export type IntakeState = { errors?: Record<string, string>; message?: string; values?: Record<string, string> };

async function ipHash() {
  // Without a secret salt the hash could be reversed, so don't store anything (rate limiting is then skipped).
  const salt = process.env.IP_HASH_SALT;
  if (!salt) { console.warn("[scorecard] IP_HASH_SALT is not set; rate limiting disabled"); return null; }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  return ip ? createHash("sha256").update(ip + salt).digest("hex") : null;
}

export async function startScorecard(_: IntakeState, formData: FormData): Promise<IntakeState> {
  const locale = await getLocale();
  const hu = locale === "hu";
  const raw = Object.fromEntries([...formData].filter(([k, v]) => !k.startsWith("$") && typeof v === "string")) as Record<string, string>;
  const parsed = getIntakeSchema(locale).safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    // Honeypot hit: give a bot nothing useful.
    if (errors.website) return { message: hu ? "Valami nem sikerült. Kérlek, próbáld újra." : "Something went wrong. Please try again." };
    return { errors, values: raw };
  }
  let token: string;
  try {
    token = await startSubmission(parsed.data, await ipHash(), locale);
  } catch (err) {
    if (err instanceof RateLimitedError) return { message: hu ? "Erről a hálózatról túl sok próbálkozás érkezett. Kérlek, próbáld újra egy óra múlva." : "Too many attempts from your network. Please try again in an hour.", values: raw };
    console.error("[scorecard] start failed", err);
    return { message: hu ? "Most nem sikerült elmenteni az adataidat. Kérlek, próbáld újra egy kicsit később." : "We couldn't save your details just now. Please try again in a moment.", values: raw };
  }
  redirect(localizePath(locale, `/scorecard/s/${token}`));
}

const SAVE_FAILED = "We couldn't save that just now. Your earlier answers are safe; please try again in a moment.";

export type StepResult = { ok: true } | { ok: false; message: string };

export async function saveAnswerAction(token: string, questionId: string, value: string): Promise<StepResult> {
  const hu = await getLocale() === "hu";
  // Server actions are public endpoints: check argument shapes before trusting them.
  if (typeof token !== "string" || typeof questionId !== "string") return { ok: false, message: hu ? "Érvénytelen kérés." : "Invalid request." };
  const v = validateAnswer(questionId, value);
  if (!v.ok) return { ok: false, message: hu ? "Ez a válasz ehhez a kérdéshez nem érvényes." : "That answer isn't valid for this question." };
  let saved: boolean;
  try {
    saved = await saveAnswer(token, questionId, v.value);
  } catch (err) {
    console.error("[scorecard] save failed", err);
    return { ok: false, message: hu ? "Most nem sikerült elmenteni a választ. A korábbi válaszaid megvannak; kérlek, próbáld újra." : SAVE_FAILED };
  }
  return saved ? { ok: true } : { ok: false, message: hu ? "Ez a felmérő már nem szerkeszthető. Kérlek, töltsd újra az oldalt." : "This scorecard can no longer be edited. Please reload the page." };
}

export async function submitAction(token: string): Promise<StepResult> {
  const locale = await getLocale();
  const hu = locale === "hu";
  if (typeof token !== "string") return { ok: false, message: hu ? "Érvénytelen kérés." : "Invalid request." };
  let result: Awaited<ReturnType<typeof submit>>;
  try {
    result = await submit(token, locale);
  } catch (err) {
    console.error("[scorecard] submit failed", err);
    return { ok: false, message: hu ? "Most nem sikerült elmenteni a választ. A korábbi válaszaid megvannak; kérlek, próbáld újra." : SAVE_FAILED };
  }
  if (result.kind === "incomplete") return { ok: false, message: hu ? "Néhány kérdésre még nem válaszoltál. Kérlek, lépj vissza, és pótold a hiányzókat." : "A few questions are still unanswered. Please go back and complete every section." };
  if (result.kind === "not-found") return { ok: false, message: hu ? "Ez a link már nem érvényes." : "This scorecard link is no longer valid." };
  // Email (PDF rendering included) runs after the response so the report opens immediately.
  if (result.kind === "created") after(() => sendReportEmails(result.submissionId));
  redirect(localizePath(locale, `/scorecard/r/${result.reportToken}`));
}

export async function changeScorecardLocaleAction(token: string, locale: unknown): Promise<StepResult> {
  if (typeof token !== "string" || (locale !== "en" && locale !== "hu")) return { ok: false, message: "Invalid request." };
  try {
    const saved = await setSubmissionLocale(token, locale);
    return saved ? { ok: true } : { ok: false, message: locale === "hu" ? "Ez a felmérő már nem szerkeszthető. Kérlek, töltsd újra az oldalt." : "This scorecard can no longer be edited. Please reload the page." };
  } catch {
    return { ok: false, message: locale === "hu" ? "Nyelvváltás előtt nem sikerült menteni. Kérlek, próbáld újra." : "We couldn't save before switching languages. Please try again." };
  }
}

export async function deleteAction(formData: FormData) {
  const locale = await getLocale();
  const token = String(formData.get("token") ?? "");
  await deleteByResumeToken(token);
  redirect(localizePath(locale, "/scorecard/delete/done"));
}
