import { AREA_NAMES, PROCESS_ID, QUESTIONS, QUESTION_BY_ID } from "../../content/scorecard/en/questions";
import { CONTENT_VERSION, FINDINGS } from "../../content/scorecard/en/findings";
import { FINDINGS as HU_FINDINGS } from "../../content/scorecard/hu/findings";
import { getQuestionContent } from "../../content/scorecard/questions";
import { formatNumber, normalizeLocale, type Locale } from "../i18n";
import { answerScore, computeScores, levelFor, quadrantFor } from "./scoring";
import { AREAS, type AreaId, type Answers, type Finding, type FindingCtx, type FindingText, type Intake, type ReportModel, type Scores } from "./types";

function makeCtx(answers: Answers, scores: Scores, intake: Intake): FindingCtx {
  const lowestArea = AREAS.reduce((low, a) => (scores[a] < scores[low] ? a : low), AREAS[0]);
  // Rules that name an unknown question or option throw, so content typos fail the coverage tests instead of silently never matching.
  const question = (id: string) => {
    const q = QUESTION_BY_ID.get(id);
    if (!q || q.kind === "text") throw new Error(`Finding rule refers to unknown question "${id}"`);
    return q;
  };
  return {
    score: id => {
      if (question(id).kind !== "scored") throw new Error(`Finding rule uses score() on unscored question "${id}"`);
      return answerScore(id, answers) ?? 0;
    },
    is: (id, ...opts) => {
      const q = question(id);
      for (const o of opts) if (!q.options.some(x => x.id === o)) throw new Error(`Finding rule refers to unknown option "${id}:${o}"`);
      return opts.includes(answers[id]);
    },
    s: scores,
    size: intake.companySize,
    industry: intake.industry,
    lowestArea,
  };
}

/** Lowest-scored answer in an area (or overall for "ALL"), formatted for quoting. */
function weakest(area: AreaId | "ALL", answers: Answers, locale: Locale): string {
  let worst: { short: string; label: string; score: number } | undefined;
  for (const q of getQuestionContent(locale).QUESTIONS) {
    if (q.kind !== "scored" || (area !== "ALL" && q.area !== area) || q.sub === "opportunity") continue;
    const opt = q.options.find(o => o.id === answers[q.id]);
    if (opt && (!worst || opt.score! < worst.score)) worst = { short: q.short.toLowerCase(), label: opt.label, score: opt.score! };
  }
  return worst ? `${worst.short}: ${locale === "hu" ? `„${worst.label}”` : `“${worst.label}”`}` : locale === "hu" ? "nincs válasz" : "not answered";
}

/** The process they named, quoted, for use mid-sentence ("Pick one measure for “Customer quotes”"). */
const processLabel = (answers: Answers, locale: Locale) => (answers[PROCESS_ID]?.trim() ? (locale === "hu" ? `„${answers[PROCESS_ID].trim()}”` : `“${answers[PROCESS_ID].trim()}”`) : locale === "hu" ? "a vizsgált folyamat" : "this process");

function interpolate(text: string, f: Finding, answers: Answers, ctx: FindingCtx, locale: Locale): string {
  const { AREA_NAMES, QUESTION_BY_ID } = getQuestionContent(locale);
  return text.replace(/\{([A-Za-z0-9.]+)\}/g, (match, key: string) => {
    if (key === "weakest") return weakest(f.area, answers, locale);
    if (key === "process") return processLabel(answers, locale);
    if (key === "lowest") return AREA_NAMES[ctx.lowestArea].toLowerCase();
    if (key.startsWith("score.")) {
      const v = ctx.s[key.slice(6) as keyof Scores];
      return typeof v === "number" ? formatNumber(v, locale) : match;
    }
    const q = QUESTION_BY_ID.get(key);
    if (!q) return match;
    if (q.kind === "text") return answers[key] ?? "";
    return q.options.find(o => o.id === answers[key])?.label ?? (locale === "hu" ? "nincs válasz" : "not answered");
  });
}

function render(f: Finding, answers: Answers, ctx: FindingCtx, locale: Locale = "en"): FindingText {
  if (locale === "hu") f = HU_FINDINGS.find(candidate => candidate.id === f.id) ?? f;
  const merged = { ...f.text, ...(ctx.industry && f.byIndustry?.[ctx.industry]), ...(ctx.size && f.bySize?.[ctx.size]) };
  const out = { id: f.id, area: f.area } as FindingText;
  for (const k of ["title", "observed", "why", "action", "done"] as const) out[k] = interpolate(merged[k], f, answers, ctx, locale);
  return out;
}

/** Priority plus a bonus for weaker areas, so the report focuses where the gap is largest. */
function rank(f: Finding, ctx: FindingCtx): number {
  const areaScore = f.area === "ALL" ? ctx.s.foundation : ctx.s[f.area];
  return f.priority + (4 - areaScore) * 10;
}

const byRank = (ctx: FindingCtx) => (a: Finding, b: Finding) => rank(b, ctx) - rank(a, ctx);

export function buildReport(answers: Answers, intake: Intake, now = new Date()): ReportModel {
  const scores = computeScores(answers);
  const ctx = makeCtx(answers, scores, intake);
  const eligible = FINDINGS.filter(f => f.when(ctx));
  const of = <K extends Finding["kind"]>(kind: K) => eligible.filter((f): f is Extract<Finding, { kind: K }> => f.kind === kind);
  const r = (f: Finding) => render(f, answers, ctx);

  const biggestRisk = of("risk").sort(byRank(ctx))[0];

  // Quick wins: best per area, then the top three areas. The risk's area is skipped: its action already covers it.
  const bestPerArea = new Map<string, Finding>();
  for (const f of of("quickWin").sort(byRank(ctx))) if (f.area !== biggestRisk.area && !bestPerArea.has(f.area)) bestPerArea.set(f.area, f);
  const quickWins = [...bestPerArea.values()].sort(byRank(ctx)).slice(0, 3);

  const roadmapFor = (window: 30 | 60 | 90) => of("roadmap").filter(f => f.window === window).sort(byRank(ctx)).slice(0, 3).map(r);

  // Next step: first matching rule in library order.
  const next = of("nextStep")[0];

  const areas = Object.fromEntries(AREAS.map(area => {
    const n = of("areaNote").find(f => f.area === area)!;
    return [area, { score: scores[area], level: levelFor(scores[area]), note: r(n) }];
  })) as ReportModel["areas"];

  const freeText = answers.FT1?.trim();
  const process = answers[PROCESS_ID]?.trim();
  return {
    locale: "en",
    contentVersion: CONTENT_VERSION,
    createdAt: now.toISOString(),
    intake,
    areas,
    ai: { raw: scores.aiRaw, shown: scores.AI, capped: scores.aiCapped },
    automation: {
      opportunity: scores.opportunity, readiness: scores.automationReady, readinessRaw: scores.readiness, capped: scores.automationCapped,
      quadrant: quadrantFor(scores.opportunity, scores.automationReady),
    },
    quickWins: quickWins.map(r),
    biggestRisk: r(biggestRisk),
    roadmap: { d30: roadmapFor(30), d60: roadmapFor(60), d90: roadmapFor(90) },
    nextStep: { kind: next.step, text: r(next) },
    ...(process ? { process } : {}),
    ...(freeText ? { freeText } : {}),
  };
}

/** Translate the selected findings, never rerank or rescore a historical result. */
export function translateReport(report: ReportModel, answers: Answers, locale: Locale): ReportModel {
  const snapshot = report.translations?.[locale];
  if (snapshot) return snapshot;
  if (normalizeLocale(report.locale) === locale) return report;
  const scores: Scores = {
    ...computeScores(answers),
    ...Object.fromEntries(AREAS.map(area => [area, report.areas[area].score])),
    aiRaw: report.ai.raw, aiCapped: report.ai.capped,
    opportunity: report.automation.opportunity, readiness: report.automation.readinessRaw,
    automationReady: report.automation.readiness, automationCapped: report.automation.capped,
    foundation: Math.min(report.areas.SS.score, report.areas.DM.score),
  };
  const ctx = makeCtx(answers, scores, report.intake);
  const text = (finding: FindingText) => {
    const source = FINDINGS.find(candidate => candidate.id === finding.id);
    return source ? render(source, answers, ctx, locale) : finding;
  };
  return {
    ...report, locale, translations: undefined,
    areas: Object.fromEntries(AREAS.map(area => [area, { ...report.areas[area], note: text(report.areas[area].note) }])) as ReportModel["areas"],
    quickWins: report.quickWins.map(text), biggestRisk: text(report.biggestRisk),
    roadmap: { d30: report.roadmap.d30.map(text), d60: report.roadmap.d60.map(text), d90: report.roadmap.d90.map(text) },
    nextStep: { kind: report.nextStep.kind, text: text(report.nextStep.text) },
  };
}
