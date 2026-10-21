import { ADVANCED_AUDIT_QUESTIONS, type AuditQuestion } from "./questions";
import type { AdvancedAuditAnswers } from "./types";

const byId = new Map<string, AuditQuestion>(ADVANCED_AUDIT_QUESTIONS.map(question => [question.id, question]));

export type AnswerValidation = { ok: true; value: string | number } | { ok: false };

export function validateAdvancedAuditAnswer(questionId: unknown, value: unknown): AnswerValidation {
  if (typeof questionId !== "string") return { ok: false };
  const question = byId.get(questionId);
  if (!question) return { ok: false };
  if (question.kind === "text") {
    if (typeof value !== "string") return { ok: false };
    let text = value.replace(/\u0000/g, "").trim();
    if (question.id === "P1_process") text = text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ");
    if (text.length > question.maxLength || (question.required && !text)) return { ok: false };
    return { ok: true, value: text };
  }
  if (typeof value !== "number" || !Number.isInteger(value)) return { ok: false };
  return question.options.some(option => option.code === value) ? { ok: true, value } : { ok: false };
}

export function validateAdvancedAuditAnswerMap(input: unknown): AdvancedAuditAnswers | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return undefined;
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0 || entries.length > ADVANCED_AUDIT_QUESTIONS.length) return undefined;
  const answerMap: AdvancedAuditAnswers = {};
  for (const [id, value] of entries) {
    const validated = validateAdvancedAuditAnswer(id, value);
    if (!validated.ok) return undefined;
    answerMap[id] = validated.value;
  }
  return answerMap;
}

export function firstOpenAdvancedAuditIndex(answers: AdvancedAuditAnswers): number {
  const index = ADVANCED_AUDIT_QUESTIONS.findIndex(question => {
    if (question.kind === "text" && !question.required) return false;
    const value = answers[question.id];
    if (question.kind === "text") return typeof value !== "string" || value.trim().length === 0;
    return !question.options.some(option => option.code === value);
  });
  return index < 0 ? ADVANCED_AUDIT_QUESTIONS.length : index;
}
