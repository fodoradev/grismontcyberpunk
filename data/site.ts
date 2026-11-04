/**
 * Facts Attila still has to supply, in one place. Unresolved values keep the content pack's FILL /
 * DECIDE placeholder markers: `known()` treats them as missing so their block stays hidden, and `npm run check:launch`
 * fails while any remain. Replace a marker with the real value and the block appears.
 * See docs/content-plan/IMPLEMENTATION.md.
 */

/** A value, or undefined while it still holds a content-pack placeholder. */
export function known<T>(value: T): Exclude<T, null> | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && (value.trim() === "" || value.includes("{" + "{"))) return undefined;
  return value as Exclude<T, null>;
}

export type CaseStudy = { title: string; problem: string; action: string; result: string; slug?: string };
type Localized<T> = { en: T; hu: T };

export const site = {
  /** Shown in the About heading ("Hi, I'm …"); the first name from data/business.ts is used until then. */
  fullName: "{{FILL: full name}}",
  /** e.g. "https://cal.com/grismont/20min". Until set, booking buttons go to the contact form. */
  bookingUrl: "{{FILL: booking link, e.g. Cal.com}}",
  linkedinUrl: "{{FILL: LinkedIn URL}}",
  greenBelt: { issuer: "{{FILL: Green Belt issuer}}", year: "{{FILL: Green Belt year}}", certificateUrl: "{{FILL: certificate URL if available}}" },
  yearsExperience: "{{FILL: years in operations and advisory}}",
  experienceAreas: {
    en: "{{FILL: e.g. shared services, logistics, finance operations}}",
    hu: "{{FILL: pl. shared service, logisztika, pénzügyi folyamatok}}",
  } as Localized<string>,
  /** About text: the roles and the office processes worked in. */
  aboutRoles: { en: "{{FILL: e.g. operations, shared services and advisory}}", hu: "{{FILL: pl. operációs, shared service és tanácsadói}}" } as Localized<string>,
  aboutProcesses: { en: "{{FILL: e.g. reporting, order handling, finance operations}}", hu: "{{FILL: pl. riportolás, rendeléskezelés, pénzügyi folyamatok}}" } as Localized<string>,
  /** Tools named in the FAQ answer, e.g. "Power Automate, Make, n8n". */
  tools: "{{FILL: tools you use, e.g. Power Automate, Make, n8n}}",
  /** Adult training registration number (07 §C), e.g. "B/2026/000123". */
  adultTrainingRegistration: "{{FILL: adult training registration number}}",
  /** Photo in public/, e.g. "/attila.jpg". */
  photo: "{{FILL: real portrait photo, 4:5, friendly, work setting}}",

  // ── [PROOF] blocks: empty until real, measured content exists (05-proof-plan.md). ──
  /** One measured result for the hero proof strip, e.g. "Month-end report: 3 days → 4 hours". */
  heroResult: { en: "{{FILL: one measured result}}", hu: "{{FILL: egy mért eredmény}}" } as Localized<string>,
  /** "Typical result" line on the weekly-report problem card, e.g. "6 hours a week → 30 minutes". */
  weeklyReportResult: { en: "{{DECIDE: show only after real proof exists}}", hu: "{{DECIDE: csak valós bizonyíték után}}" } as Localized<string>,
  /** Career timeline rows for #about: years, role, one result. */
  timeline: { en: [], hu: [] } as Localized<{ years: string; role: string; result: string }[]>,
  /** The #proof section shows once at least two are real. */
  caseStudies: { en: [], hu: [] } as Localized<CaseStudy[]>,
  testimonial: null as null | Localized<{ quote: string; name: string }>,
  /** /scorecard/sample (04 §5), generated from lib/scorecard/sample.ts. Links to it appear only while true. */
  sampleReportPublished: true,
} as const;
