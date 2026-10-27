import { describe, expect, it } from "vitest";
import * as en from "../../content/scorecard/en/questions";
import * as hu from "../../content/scorecard/hu/questions";
import * as enCopy from "../../content/scorecard/en/copy";
import * as huCopy from "../../content/scorecard/hu/copy";
import { FINDINGS } from "../../content/scorecard/en/findings";
import { FINDINGS as HU_FINDINGS } from "../../content/scorecard/hu/findings";
import { getQuestionContent } from "../../content/scorecard/questions";
import { getScorecardCopy } from "../../content/scorecard/copy";
import { formatNumber, levelLabel, localeFromPath, localizePath, normalizeLocale } from "../../lib/i18n";
import { ownerNotifyEmail, reminderEmail, reportEmail } from "../../lib/email/templates";
import { buildReport, translateReport } from "../../lib/scorecard/report";
import { answerScore, computeScores } from "../../lib/scorecard/scoring";
import { AREAS, INDUSTRIES, SIZE_BANDS, type Finding, type FindingCtx, type FindingText, type Intake, type Question, type ReportModel, type TextFields } from "../../lib/scorecard/types";
import { randomAnswers, rng, uniformAnswers } from "./fixtures";

const intake: Intake = { firstName: "Anna", companySize: "11-50", industry: "services" };
const now = new Date("2026-10-20T12:00:00.000Z");
const placeholders = (text: string) => [...text.matchAll(/\{([^{}]+)\}/g)].map(match => match[1]).sort();

function expectTranslation(source: string, translated: string, label: string) {
  expect(translated.trim().length, label).toBeGreaterThan(0);
  expect(placeholders(translated), label).toEqual(placeholders(source));
  // Numeric ranges and percentages are language independent.
  if (/\p{L}/u.test(source)) expect(translated, label).not.toBe(source);
  expect(translated, label).not.toMatch(/\b(?:TODO|FIXME|TBD)\b/);
}

function questionShape(q: Question) {
  const { short, prompt, promptByIndustry, ...rest } = q;
  if (rest.kind === "text") {
    const { help, placeholder, ...shape } = rest;
    return shape;
  }
  return { ...rest, options: rest.options.map(({ label, ...option }) => option) };
}

const selected = (r: ReportModel) => ({
  areas: AREAS.map(area => [area, r.areas[area].note.id]),
  quickWins: r.quickWins.map(f => f.id),
  biggestRisk: r.biggestRisk.id,
  roadmap: Object.fromEntries(Object.entries(r.roadmap).map(([key, findings]) => [key, findings.map(f => f.id)])),
  nextStep: { kind: r.nextStep.kind, id: r.nextStep.text.id },
});

const findingsIn = (r: ReportModel): FindingText[] => [
  ...AREAS.map(area => r.areas[area].note), ...r.quickWins, r.biggestRisk,
  ...r.roadmap.d30, ...r.roadmap.d60, ...r.roadmap.d90, r.nextStep.text,
];

describe("locale helpers", () => {
  it.each([undefined, null, "", "en", "HU", "hu-HU", "de", 1, {}, ["hu"]])("defaults unsupported locale %j to English", value => {
    expect(normalizeLocale(value)).toBe("en");
  });

  it("accepts Hungarian explicitly and selects the matching content modules", () => {
    expect(normalizeLocale("hu")).toBe("hu");
    expect(getQuestionContent("en")).toBe(en);
    expect(getQuestionContent("hu")).toBe(hu);
    expect(getScorecardCopy("en")).toBe(enCopy);
    expect(getScorecardCopy("hu")).toBe(huCopy);
  });

  it.each([
    ["/hu", "hu"], ["/hu/", "hu"], ["/hu/scorecard", "hu"], ["/hu?x=1", "hu"], ["/hu#intro", "hu"],
    ["/", "en"], ["/human", "en"], ["/huge/path", "en"], ["/hu-HU", "en"], ["/HU", "en"],
    ["/scorecard/hu", "en"], ["/?next=/hu", "en"], ["//hu/path", "en"], ["https://example.test/hu", "en"],
  ] as const)("detects the locale of %s at segment boundaries", (path, locale) => {
    expect(localeFromPath(path)).toBe(locale);
  });

  it.each([
    ["/", "/", "/hu"], ["/hu", "/", "/hu"], ["/hu/", "/", "/hu"],
    ["/?x=1", "/?x=1", "/hu?x=1"], ["/hu?x=1", "/?x=1", "/hu?x=1"],
    ["/#intro", "/#intro", "/hu#intro"], ["/hu#intro", "/#intro", "/hu#intro"],
    ["/hu/?x=1#intro", "/?x=1#intro", "/hu?x=1#intro"],
    ["/scorecard", "/scorecard", "/hu/scorecard"],
    ["/hu/scorecard", "/scorecard", "/hu/scorecard"],
    ["/hu/scorecard/?next=%2Fhu%2Freport&x=a+b#results", "/scorecard/?next=%2Fhu%2Freport&x=a+b#results", "/hu/scorecard/?next=%2Fhu%2Freport&x=a+b#results"],
    ["/human", "/human", "/hu/human"], ["/huge/path", "/huge/path", "/hu/huge/path"],
    ["/hu-HU", "/hu-HU", "/hu/hu-HU"], ["/HU/path", "/HU/path", "/hu/HU/path"],
    ["/hu%2Fpath", "/hu%2Fpath", "/hu/hu%2Fpath"],
    ["/scorecard/hu?next=/hu#hu", "/scorecard/hu?next=/hu#hu", "/hu/scorecard/hu?next=/hu#hu"],
  ])("localizes %s without changing query, hash, or unrelated prefixes", (path, english, hungarian) => {
    expect(localizePath("en", path)).toBe(english);
    expect(localizePath("hu", path)).toBe(hungarian);
    expect(localizePath("hu", hungarian)).toBe(hungarian);
    expect(localizePath("en", hungarian)).toBe(english);
  });

  it.each(["", "relative/path", "?x=/hu", "#intro", "https://example.test/hu?a=1#x", "http://example.test/", "//example.test/hu", "mailto:hello@example.test", "tel:+3612345678"])("leaves non-local reference %j unchanged", path => {
    expect(localizePath("en", path)).toBe(path);
    expect(localizePath("hu", path)).toBe(path);
  });

  it("formats scores and maturity labels without changing unknown labels", () => {
    expect(formatNumber(3.5, "en")).toBe("3.5");
    expect(formatNumber(3.5, "hu")).toBe("3,5");
    expect(formatNumber(4, "hu")).toBe("4,0");
    for (const level of ["Ad hoc", "Person-dependent", "Documented", "Managed", "Improving"]) {
      expect(levelLabel(level, "en")).toBe(level);
      expectTranslation(level, levelLabel(level, "hu"), level);
    }
    expect(levelLabel("Historical label", "hu")).toBe("Historical label");
  });
});

describe("question localization parity", () => {
  it("preserves question order, IDs, scoring, required flags, limits, and diagnostic option IDs", () => {
    expect(hu.PROCESS_ID).toBe(en.PROCESS_ID);
    expect(hu.QUESTIONS.map(questionShape)).toEqual(en.QUESTIONS.map(questionShape));
    for (const content of [en, hu]) {
      expect(new Set(content.QUESTIONS.map(q => q.id)).size).toBe(content.QUESTIONS.length);
      expect(content.QUESTION_BY_ID.size).toBe(content.QUESTIONS.length);
      for (const q of content.QUESTIONS) expect(content.QUESTION_BY_ID.get(q.id), q.id).toBe(q);
    }
  });

  it("translates prompts, helper text, option labels, and every industry variant while retaining placeholders", () => {
    for (const q of en.QUESTIONS) {
      const translated = hu.QUESTION_BY_ID.get(q.id)!;
      expectTranslation(q.short, translated.short, `${q.id}.short`);
      expectTranslation(q.prompt, translated.prompt, `${q.id}.prompt`);
      expect(Object.keys(translated.promptByIndustry ?? {}).sort(), q.id).toEqual(Object.keys(q.promptByIndustry ?? {}).sort());
      for (const industry of INDUSTRIES) {
        expect(hu.promptFor(translated, industry)).toBe(translated.promptByIndustry?.[industry] ?? translated.prompt);
        expectTranslation(en.promptFor(q, industry), hu.promptFor(translated, industry), `${q.id}.${industry}`);
      }
      if (q.kind === "text" && translated.kind === "text") {
        for (const key of ["help", "placeholder"] as const) {
          expect(Boolean(translated[key]), `${q.id}.${key}`).toBe(Boolean(q[key]));
          if (q[key]) expectTranslation(q[key], translated[key]!, `${q.id}.${key}`);
        }
      } else if (q.kind !== "text" && translated.kind !== "text") {
        q.options.forEach((option, i) => expectTranslation(option.label, translated.options[i].label, `${q.id}.${option.id}`));
      }
    }
  });

  it("translates all area, size, and industry labels with the same lookup keys", () => {
    for (const key of ["AREA_NAMES", "AREA_INTROS", "SIZE_LABELS", "INDUSTRY_LABELS"] as const) {
      expect(Object.keys(hu[key]).sort()).toEqual(Object.keys(en[key]).sort());
      for (const [id, label] of Object.entries(en[key])) expectTranslation(label, (hu[key] as Record<string, string>)[id], `${key}.${id}`);
    }
  });
});

describe("findings localization parity", () => {
  const translatedById = new Map(HU_FINDINGS.map(f => [f.id, f]));

  it("keeps unique IDs, library order, selection metadata, and variant keys", () => {
    expect(translatedById.size).toBe(HU_FINDINGS.length);
    expect(new Set(FINDINGS.map(f => f.id)).size).toBe(FINDINGS.length);
    const shape = ({ when, text, bySize, byIndustry, ...rest }: Finding) => ({
      ...rest,
      bySize: Object.fromEntries(Object.entries(bySize ?? {}).map(([key, fields]) => [key, Object.keys(fields).sort()])),
      byIndustry: Object.fromEntries(Object.entries(byIndustry ?? {}).map(([key, fields]) => [key, Object.keys(fields).sort()])),
    });
    expect(HU_FINDINGS.map(shape)).toEqual(FINDINGS.map(shape));
  });

  it("translates every populated field and variant without losing or inventing placeholders", () => {
    for (const finding of FINDINGS) {
      const translated = translatedById.get(finding.id)!;
      const variants = (f: Finding): Record<string, Partial<TextFields>> => ({ text: f.text, ...Object.fromEntries(Object.entries(f.bySize ?? {}).map(([k, v]) => [`size.${k}`, v])), ...Object.fromEntries(Object.entries(f.byIndustry ?? {}).map(([k, v]) => [`industry.${k}`, v])) });
      const translatedVariants = variants(translated);
      for (const [variant, fields] of Object.entries(variants(finding))) {
        for (const [field, source] of Object.entries(fields)) {
          const value = translatedVariants[variant][field as keyof typeof fields];
          if (source) expectTranslation(source, value!, `${finding.id}.${variant}.${field}`);
          else expect(value, `${finding.id}.${variant}.${field}`).toBe("");
        }
      }
    }
  });

  it("preserves rule results across scores, diagnostic answers, sizes, industries, and threshold boundaries", () => {
    const rand = rng(20261020);
    const cases = [...Array.from({ length: 5 }, (_, i) => uniformAnswers(i)), ...Array.from({ length: 100 }, () => randomAnswers(rand))];
    for (const answers of cases) for (const size of SIZE_BANDS) for (const industry of INDUSTRIES) {
      const s = computeScores(answers);
      const ctx: FindingCtx = {
        s, size, industry, lowestArea: AREAS.reduce((low, area) => s[area] < s[low] ? area : low, AREAS[0]),
        score: id => {
          expect(en.QUESTION_BY_ID.get(id)?.kind, id).toBe("scored");
          return answerScore(id, answers) ?? 0;
        },
        is: (id, ...options) => {
          const q = en.QUESTION_BY_ID.get(id);
          expect(q && q.kind !== "text", id).toBe(true);
          if (!q || q.kind === "text") throw new Error(`Unknown diagnostic question ${id}`);
          for (const option of options) expect(q.options.some(o => o.id === option), `${id}:${option}`).toBe(true);
          return options.includes(answers[id]);
        },
      };
      for (const finding of FINDINGS) expect(translatedById.get(finding.id)!.when(ctx), `${finding.id}/${size}/${industry}`).toBe(finding.when(ctx));
    }
    for (const boundary of [1.5, 2, 2.75, 3, 3.5]) for (const offset of [-0.01, 0, 0.01]) {
      const value = boundary + offset;
      const ctx: FindingCtx = { s: { ...computeScores(uniformAnswers(2)), ...Object.fromEntries([...AREAS, "foundation", "opportunity", "automationReady"].map(key => [key, value])) }, size: "11-50", industry: "services", lowestArea: "SS", score: () => value, is: () => false };
      for (const finding of FINDINGS) expect(translatedById.get(finding.id)!.when(ctx), `${finding.id}@${value}`).toBe(finding.when(ctx));
    }
  });
});

describe("translateReport", () => {
  it("keeps historical scores, selected IDs, order, date, intake, and user text even when current answers would select a different report", () => {
    const answers = uniformAnswers(3, { P1: "SAP rendelésrögzítés", FT1: "HR & AI: három jóváhagyás" });
    const stored = buildReport(answers, intake, now);
    stored.quickWins.reverse();
    stored.roadmap.d30.reverse();
    stored.areas.SS.score = 1.2;
    stored.areas.SS.level = "Person-dependent";
    stored.ai = { raw: 3.8, shown: 2.2, capped: true };
    stored.automation = { opportunity: 3.6, readiness: 1.2, readinessRaw: 3.7, capped: true, quadrant: "fix-first" };
    const before = structuredClone(stored);
    const changedAnswers = uniformAnswers(0, { P1: answers.P1, FT1: answers.FT1 });
    expect(selected(buildReport(changedAnswers, intake, now))).not.toEqual(selected(stored));
    const result = translateReport(stored, changedAnswers, "hu");
    expect(result.locale).toBe("hu");
    expect(selected(result)).toEqual(selected(before));
    for (const area of AREAS) {
      expect(result.areas[area].score, area).toBe(before.areas[area].score);
      expect(result.areas[area].level, area).toBe(before.areas[area].level);
    }
    for (const key of ["contentVersion", "createdAt", "intake", "ai", "automation", "process", "freeText"] as const) expect(result[key], key).toEqual(before[key]);
    expect(result.translations).toBeUndefined();
    expect(stored).toEqual(before);
    findingsIn(result).forEach((finding, i) => {
      expect(finding.title, finding.id).not.toBe(findingsIn(before)[i].title);
      expect(JSON.stringify(finding), finding.id).not.toMatch(/\{[A-Za-z0-9.]+\}/);
    });
  });

  it("interpolates Hungarian option labels, process names, and weakest-answer quotes", () => {
    const answers = uniformAnswers(3, { P1: "SAP rendelésrögzítés", AI1: "o0", AI2: "o0" });
    const english = buildReport(answers, intake, now);
    const result = translateReport(english, answers, "hu");
    expect(result.biggestRisk.id).toBe("risk-shadow-ai");
    const q = hu.QUESTION_BY_ID.get("AI1")!;
    if (q.kind === "text") throw new Error("AI1 must have options");
    expect(result.biggestRisk.observed).toContain(q.options[0].label);
    const text = JSON.stringify(findingsIn(result));
    expect(text).toContain("„SAP rendelésrögzítés”");
    expect(text).not.toMatch(/not answered|\{(?:weakest|lowest|process|score\.[^}]+)\}/);
    expect(text).toContain("„");
  });

  it("returns stored language snapshots verbatim, ahead of current locale and changed answers", () => {
    const report = buildReport(uniformAnswers(3), intake, now);
    const snapshot = { ...structuredClone(report), locale: "hu" as const, contentVersion: "archived", quickWins: [{ ...report.quickWins[0], id: "retired-selection", title: "Eltárolt javaslat" }] };
    report.translations = { hu: snapshot };
    expect(translateReport(report, uniformAnswers(0), "hu")).toBe(snapshot);
    expect(snapshot.quickWins[0].id).toBe("retired-selection");
    report.locale = "hu";
    expect(translateReport(report, {}, "hu")).toBe(snapshot);
  });

  it("defaults legacy reports to English and is a no-op for the current language", () => {
    const report = buildReport(uniformAnswers(2), intake, now);
    expect(report.locale).toBe("en");
    expect(translateReport(report, {}, "en")).toBe(report);
    delete report.locale;
    expect(translateReport(report, {}, "en")).toBe(report);
    const hungarian = translateReport(report, uniformAnswers(2), "hu");
    expect(translateReport(hungarian, {}, "hu")).toBe(hungarian);
    expect(translateReport(hungarian, uniformAnswers(2), "en")).toEqual({ ...report, locale: "en", translations: undefined });
  });

  it("keeps unknown historical findings instead of replacing their selection", () => {
    const report = buildReport(uniformAnswers(2), intake, now);
    report.quickWins[0] = { ...report.quickWins[0], id: "retired-finding", title: "Archived title" };
    expect(translateReport(report, uniformAnswers(2), "hu").quickWins[0]).toEqual(report.quickWins[0]);
  });
});

describe("localized emails", () => {
  it.each(["en", "hu"] as const)("uses %s and escapes names, finding text, and URL attributes", locale => {
    const report = buildReport(uniformAnswers(2), { ...intake, firstName: `<Anna & "O'Neil">` }, now);
    report.locale = locale;
    const unsafe = `<script>alert("x" & 'y')</script>`;
    const escaped = "&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;";
    report.biggestRisk.title = unsafe;
    report.quickWins[0].title = unsafe;
    report.process = unsafe;
    report.freeText = unsafe;
    const url = `https://example.test/${locale === "hu" ? "hu/" : ""}scorecard/r/token?a=1&b="'<>`;
    const expectedUrl = url.replace('&b="\'<>', "&amp;b=&quot;&#39;&lt;&gt;");
    const result = reportEmail(report, { report: url, delete: url, audit: url, booking: url });
    const reminder = reminderEmail(report.intake.firstName, 5, 32, { resume: url, delete: url }, locale);
    const owner = ownerNotifyEmail(report, { email: "anna@example.test", role: unsafe, companyName: unsafe, profile: unsafe, reportUrl: url });
    for (const email of [result, reminder, owner]) {
      expect(email.html).toContain(`<html lang="${locale}">`);
      expect(email.html).toContain("&lt;Anna &amp; &quot;O&#39;Neil&quot;&gt;");
      expect(email.html).toContain(`href="${expectedUrl}"`);
      expect(email.html).not.toContain("<script>");
      expect(email.text).toContain(report.intake.firstName);
      expect(email.text).toContain(url);
    }
    for (const email of [result, owner]) {
      expect(email.html).toContain(escaped);
      expect(email.text).toContain(unsafe);
    }
    expect(result.subject).toBe(locale === "hu" ? "A Folyamat-pontozó eredményed (PDF)" : "Your scorecard report (PDF)");
    expect(reportEmail(report, { report: url, delete: url, audit: url }).text).toContain(locale === "hu" ? "Válaszolj erre az e-mailre" : "Reply to this email");
    expect(reminder.subject).toBe(locale === "hu" ? "Folytasd a Grismont Folyamat-pontozóját" : "Your Discovery Scorecard is waiting");
    expect(owner.subject).toContain(locale === "hu" ? hu.INDUSTRY_LABELS.services : "services");
  });

  it("defaults legacy report and reminder emails to English", () => {
    const report = buildReport(uniformAnswers(2), intake, now);
    delete report.locale;
    const links = { report: "https://example.test/report", delete: "https://example.test/delete", resume: "https://example.test/resume", audit: "https://example.test/advanced-audit" };
    expect(reportEmail(report, links).html).toContain('<html lang="en">');
    expect(reminderEmail("Anna", 0, 32, links).html).toContain('<html lang="en">');
  });
});
