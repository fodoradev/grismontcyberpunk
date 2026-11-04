import { describe, expect, it } from "vitest";
import { getHomeContent } from "../../content/site/home";
import { known } from "../../data/site";
import { formatFt } from "../../data/offers";
import { getContactSchema } from "../../lib/contact/validation";
import { getVisual, visuals, type VisualId } from "../../data/visuals";

describe("known()", () => {
  it("treats content-pack placeholders and blanks as missing", () => {
    expect(known("{{FILL: booking link}}")).toBeUndefined();
    expect(known("Kft {{DECIDE: x}}")).toBeUndefined();
    expect(known("  ")).toBeUndefined();
    expect(known(null)).toBeUndefined();
    expect(known("https://cal.com/x")).toBe("https://cal.com/x");
    expect(known(10)).toBe(10);
  });
});

describe("home content", () => {
  it.each(["en", "hu"] as const)("never renders a {{placeholder}} (%s)", locale => {
    expect(JSON.stringify(getHomeContent(locale))).not.toMatch(/\{\{/);
  });

  it("has the same structure in English and Hungarian", () => {
    const en = getHomeContent("en"), hu = getHomeContent("hu");
    expect(hu.problems.cards.map(c => [c.before.length, c.after.length])).toEqual(en.problems.cards.map(c => [c.before.length, c.after.length]));
    expect(hu.services.cards.map(c => c.id)).toEqual(en.services.cards.map(c => c.id));
    expect(hu.services.cards.map(c => Boolean(c.guarantee))).toEqual(en.services.cards.map(c => Boolean(c.guarantee)));
    expect(hu.faq.items.length).toBe(en.faq.items.length);
    expect(hu.strip.items.length).toBe(3);
    expect(Boolean(hu.proof)).toBe(Boolean(en.proof));
  });

  it("formats prices the Hungarian way", () => {
    expect(formatFt(1_390_000)).toBe("1 390 000 Ft");
    expect(getHomeContent("hu").services.cards.find(c => c.id === "programme")!.price.launch).toBe(`${formatFt(890_000)}-tól`);
    expect(getHomeContent("en").services.cards.find(c => c.id === "programme")!.price.launch).toBe(`from ${formatFt(890_000)}`);
  });
});

describe("contact form validation", () => {
  const valid = { name: "Anna", email: " Anna@Example.com ", message: "Weekly report\u0000 takes a day", consent: "on" };
  it("accepts a valid message and normalises it", () => {
    const r = getContactSchema("en").parse(valid);
    expect(r.email).toBe("anna@example.com");
    expect(r.message).toBe("Weekly report takes a day");
  });
  it("requires consent, a message and a known interest", () => {
    expect(getContactSchema("en").safeParse({ ...valid, consent: undefined }).success).toBe(false);
    expect(getContactSchema("hu").safeParse({ ...valid, message: "  " }).success).toBe(false);
    expect(getContactSchema("en").safeParse({ ...valid, interest: "coffee" }).success).toBe(false);
    expect(getContactSchema("en").safeParse({ ...valid, interest: "sprint" }).success).toBe(true);
  });
  it("rejects the honeypot", () => {
    expect(getContactSchema("en").safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });
});

import { sampleAnswers, sampleReport } from "../../lib/scorecard/sample";
import { isComplete } from "../../lib/scorecard/validation";

describe("sample report", () => {
  it.each(["en", "hu"] as const)("is complete and fully rendered (%s)", locale => {
    expect(isComplete(sampleAnswers(locale))).toBe(true);
    const r = sampleReport(locale);
    expect(r.locale ?? "en").toBe(locale);
    expect(r.quickWins).toHaveLength(3);
    expect(JSON.stringify(r)).not.toMatch(/\{[A-Za-z.]+\}/);
  });
});

describe("visuals", () => {
  it.each(Object.keys(visuals) as VisualId[])("%s never exposes its marker as a path", id => {
    for (const locale of ["en", "hu"] as const) {
      const v = getVisual(id, locale);
      expect(v.src ?? "").not.toMatch(/\{\{/);
      expect(v.name && v.brief && v.alt).toBeTruthy();
    }
  });
});
