import type { Quadrant, ReportModel } from "../../../lib/scorecard/types";

/** Report wording shared by the web page and the PDF. */

export const QUADRANT_TEXT: Record<Quadrant, { title: string; text: string }> = {
  "automate-now": { title: "Automate now", text: "Plenty of rule-based manual work, and the basics to automate it safely. This is where automation pays back fastest." },
  "fix-first": { title: "Fix, then automate", text: "Plenty of manual work, but the steps, data or systems aren't ready. Automating now would lock in today's problems." },
  "ready-low-volume": { title: "Ready, low volume", text: "You could automate, but there isn't much repetitive work to take away. Pick targets carefully." },
  "low-priority": { title: "Not the bottleneck", text: "Little rule-based manual work and low readiness. Automation is not where your next gain is." },
};

export const ROADMAP_COLUMNS = [
  { key: "d30", label: "Days 1–30", sub: "See the work, make it safe" },
  { key: "d60", label: "Days 31–60", sub: "Standardise and remove waste" },
  { key: "d90", label: "Days 61–90", sub: "Automate, add AI, make it stick" },
] as const;

export const capNote = (r: ReportModel) =>
  `Your AI answers score ${r.ai.raw.toFixed(1)} (the light bar), but AI can only be as reliable as the process and data underneath it. Until stability and data improve, it counts as ${r.ai.shown.toFixed(1)}.`;

export const automationCapNote = (r: ReportModel) =>
  `Your automation answers alone score ${r.automation.readinessRaw.toFixed(1)}, but readiness counts as ${r.automation.readiness.toFixed(1)}: automation copies a process exactly, errors included, so it can't be more ready than your process stability and data.`;

export const QUADRANT_AXES = { up: "More manual, rule-based work", right: "More ready to automate" };

/** Opening line under the report title. */
export const reportIntro = (r: ReportModel) =>
  `${r.process ? `Based on your answers about “${r.process}”. ` : ""}Six areas, scored 0–4. The order matters: process foundations first, then automation, then AI.`;

export const freeTextLabel = (r: ReportModel) => (r.process ? `What goes wrong in “${r.process}”` : "What goes wrong");

export const formatReportDate = (r: ReportModel) =>
  new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * The process name as it reads mid-sentence: "Month-end invoicing" → "month-end invoicing", while acronyms such as
 * "SAP order entry" or "HR onboarding" keep their capitals.
 */
export const midSentence = (name: string) => (/^[A-Z][a-z]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name);
