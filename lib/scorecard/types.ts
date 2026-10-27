import type { Locale } from "../i18n";

export const AREAS = ["FW", "SS", "DM", "AP", "AI", "PO"] as const;
export type AreaId = (typeof AREAS)[number];

export const SIZE_BANDS = ["1-10", "11-50", "51-250", "250+"] as const;
export type SizeBand = (typeof SIZE_BANDS)[number];

export const INDUSTRIES = ["manufacturing", "services", "office", "other"] as const;
export type Industry = (typeof INDUSTRIES)[number];

/** Answers keyed by question id: an option id ("o0".."o4") or free text. */
export type Answers = Record<string, string>;

export type Option = { id: string; label: string; score?: number };

type QuestionBase = {
  id: string;
  area: AreaId;
  /** Short name used when the report quotes this question. */
  short: string;
  prompt: string;
  promptByIndustry?: Partial<Record<Industry, string>>;
};

export type ScoredQuestion = QuestionBase & { kind: "scored"; sub?: "opportunity" | "readiness"; options: Option[] };
export type DiagQuestion = QuestionBase & { kind: "diag"; options: Option[] };
/** Text questions may sit outside the six areas (the opening process question has no area). */
export type TextQuestion = Omit<QuestionBase, "area"> & { area?: AreaId; kind: "text"; maxLength: number; placeholder?: string; help?: string; required?: boolean };
export type Question = ScoredQuestion | DiagQuestion | TextQuestion;

export type Level = "Ad hoc" | "Person-dependent" | "Documented" | "Managed" | "Improving";

export type Scores = Record<AreaId, number> & {
  aiRaw: number;
  aiCapped: boolean;
  opportunity: number;
  /** Automation readiness from the AP questions alone. */
  readiness: number;
  /** Readiness capped by foundation: you can't automate more safely than the process is stable. Drives the quadrant. */
  automationReady: number;
  automationCapped: boolean;
  foundation: number;
};

export type Quadrant = "automate-now" | "fix-first" | "ready-low-volume" | "low-priority";

export type NextStepKind = "fix-first" | "training" | "workshop" | "project";

export type TextFields ={ title: string; observed: string; why: string; action: string; done: string };
export type FindingText = TextFields & { id: string; area: AreaId | "ALL" };

export type FindingCtx = {
  /** 0–4 score of a scored question. */
  score: (questionId: string) => number;
  /** True if the answer to a question is one of the given option ids. */
  is: (questionId: string, ...optionIds: string[]) => boolean;
  s: Scores;
  size?: SizeBand;
  industry?: Industry;
  lowestArea: AreaId;
};

type FindingBase = {
  id: string;
  area: AreaId | "ALL";
  /** Higher wins. Specific findings 50–90, fallbacks 10–30; weaker areas get a bonus at selection time. */
  priority: number;
  when: (c: FindingCtx) => boolean;
  /**
   * Placeholders: {QID} → the chosen option label (or free text), {weakest} → the lowest-scored answer in the
   * finding's area, {process} → the process they answered for, in quotes, {lowest} → the name of the lowest-scoring area, {score.KEY} → a score from Scores
   * (e.g. {score.SS}, {score.opportunity}).
   */
  text: TextFields;
  bySize?: Partial<Record<SizeBand, Partial<TextFields>>>;
  byIndustry?: Partial<Record<Industry, Partial<TextFields>>>;
};

export type Finding =
  | (FindingBase & { kind: "quickWin" })
  | (FindingBase & { kind: "risk" })
  | (FindingBase & { kind: "areaNote" })
  | (FindingBase & { kind: "roadmap"; window: 30 | 60 | 90 })
  | (FindingBase & { kind: "nextStep"; step: NextStepKind });

/** Size and type of work are optional: they are asked after the last question and may be skipped. */
export type Intake ={ firstName: string; companySize?: SizeBand; industry?: Industry; companyName?: string };

export type ReportModel = {
  locale?: Locale;
  /** Language snapshots share the original scores, finding IDs and creation time. */
  translations?: Partial<Record<Locale, ReportModel>>;
  contentVersion: string;
  createdAt: string;
  intake: Intake;
  areas: Record<AreaId, { score: number; level: Level; note: FindingText }>;
  ai: { raw: number; shown: number; capped: boolean };
  /** `readiness` is what the quadrant plots (capped); `readinessRaw` is the AP answers alone. */
  automation: { opportunity: number; readiness: number; readinessRaw: number; capped: boolean; quadrant: Quadrant };
  quickWins: FindingText[];
  biggestRisk: FindingText;
  roadmap: { d30: FindingText[]; d60: FindingText[]; d90: FindingText[] };
  nextStep: { kind: NextStepKind; text: FindingText };
  /** The process the person answered for (opening question). Missing on reports made before it existed. */
  process?: string;
  freeText?: string;
};
