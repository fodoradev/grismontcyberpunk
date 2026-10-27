import { z } from "zod";
import { QUESTIONS, QUESTION_BY_ID } from "../../content/scorecard/en/questions";
import { INDUSTRIES, SIZE_BANDS, type Answers } from "./types";
import type { Locale } from "../i18n";

const optional = (max: number, message?: string) => z.string().trim().max(max, message).optional().transform(v => v || undefined);

const checkbox = z.literal("on").optional();

/** Step 1, before question 1: only what is needed to save progress and send the report (04 §2). */
export const intakeSchema = z.object({
  firstName: z.string().trim().min(1, "Please tell us your first name.").max(60),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email("Please enter a valid email address.")),
  consent: z.literal("on", "Please confirm you've read the privacy notice."),
  reminders: checkbox,
  // Honeypot: real people never see or fill this field.
  website: z.string().max(0).optional(),
});
export function getIntakeSchema(locale: Locale) {
  if (locale === "en") return intakeSchema;
  return z.object({
    firstName: z.string().trim().min(1, "Kérlek, add meg a keresztneved.").max(60, "A keresztnév legfeljebb 60 karakter lehet."),
    email: z.string().trim().toLowerCase().max(254, "Az e-mail-cím legfeljebb 254 karakter lehet.").pipe(z.email("Kérlek, adj meg egy érvényes e-mail-címet.")),
    consent: z.literal("on", "Kérlek, erősítsd meg, hogy elolvastad az adatkezelési tájékoztatót."),
    reminders: checkbox,
    website: z.string().max(0).optional(),
  });
}

/** Step 3, after the last question: everything optional; anything invalid is dropped rather than blocking the report. */
export const profileSchema = z.object({
  companySize: z.enum(SIZE_BANDS).optional().catch(undefined),
  industry: z.enum(INDUSTRIES).optional().catch(undefined),
  role: optional(80).catch(undefined),
  companyName: optional(120).catch(undefined),
  followUp: checkbox.catch(undefined),
});
export type ProfileInput = Partial<z.infer<typeof profileSchema>>;
export type IntakeInput = z.infer<typeof intakeSchema>;

/** Validates one answer against the question bank. Text is trimmed and length-capped; NULs are stripped for jsonb. */
export function validateAnswer(questionId: string, value: unknown): { ok: true; value: string } | { ok: false } {
  const q = QUESTION_BY_ID.get(questionId);
  if (!q || typeof value !== "string") return { ok: false };
  if (q.kind === "text") {
    const v = value.replace(/\u0000/g, "").trim().slice(0, q.maxLength);
    return q.required && !v ? { ok: false } : { ok: true, value: v };
  }
  return q.options.some(o => o.id === value) ? { ok: true, value } : { ok: false };
}

/** Answered = has a valid stored answer. An optional text question skipped with an empty answer counts as answered. */
export const isAnswered = (questionId: string, answers: Answers) => questionId in answers && validateAnswer(questionId, answers[questionId]).ok;

export const answeredCount = (answers: Answers) => QUESTIONS.filter(q => isAnswered(q.id, answers)).length;

/** Index of the first question still to answer, or QUESTIONS.length when everything is answered. */
export function firstOpenIndex(answers: Answers): number {
  const i = QUESTIONS.findIndex(q => !isAnswered(q.id, answers));
  return i === -1 ? QUESTIONS.length : i;
}

/** True when every required question has a valid answer (optional text may be missing). */
export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every(q => (q.kind === "text" && !q.required && !(q.id in answers)) || isAnswered(q.id, answers));
}
