import { QUESTIONS } from "../../content/scorecard/en/questions";
import { buildReport, translateReport } from "./report";
import type { Answers, AreaId, ReportModel } from "./types";
import type { Locale } from "../i18n";

/**
 * Fictional company, clearly labelled on the page: Példa Kft., 85 people, metal parts manufacturer, assessing
 * "Customer order to production order". Typical answers for a growing manufacturer: plenty of rule-based manual
 * work, person-dependent steps and weak data, so the engine itself decides the scores, findings and roadmap.
 */
const AREA_LEVEL: Record<AreaId, number> = { FW: 1, SS: 1, DM: 2, AP: 2, AI: 1, PO: 2 };
const OVERRIDES: Record<string, number> = { FW3: 2, SS2: 2, DM1: 1, DM4: 1, AP1: 3, AP2: 3, PO3: 1 };

export const SAMPLE_PROCESS = { en: "Customer order to production order", hu: "Vevői rendelésből gyártási rendelés" } as const;
const FREE_TEXT = {
  en: "Orders arrive by email and phone. Sales retypes them into the ERP, and production planning checks every order again because drawings and quantities are often missing.",
  hu: "A rendelések e-mailben és telefonon érkeznek. Az értékesítés újragépeli őket az ERP-be, a gyártástervezés pedig minden rendelést újra ellenőriz, mert gyakran hiányzik a rajz vagy a mennyiség.",
};

export function sampleAnswers(locale: Locale): Answers {
  const answers: Answers = { P1: SAMPLE_PROCESS[locale], FT1: FREE_TEXT[locale] };
  for (const q of QUESTIONS) {
    if (q.kind === "scored") answers[q.id] = q.options[OVERRIDES[q.id] ?? AREA_LEVEL[q.area]].id;
    if (q.kind === "diag") answers[q.id] = q.options.find(o => o.id === "info")?.id ?? q.options[0].id;
  }
  return answers;
}

export function sampleReport(locale: Locale): ReportModel {
  const en = buildReport(sampleAnswers("en"), { firstName: "Anna", companySize: "51-250", industry: "manufacturing", companyName: "Példa Kft." }, new Date("2026-10-01T09:00:00Z"));
  return locale === "hu" ? translateReport(en, sampleAnswers("hu"), "hu") : en;
}
