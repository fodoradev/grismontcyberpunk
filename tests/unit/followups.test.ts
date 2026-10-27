import { describe, expect, it } from "vitest";
import { nextFollowUp } from "../../lib/scorecard/followups";

const DAY = 24 * 60 * 60 * 1000;
const done = new Date("2026-10-01T10:00:00Z");
const at = (days: number) => done.getTime() + days * DAY;

describe("follow-up schedule", () => {
  it("sends nothing before day 2", () => {
    expect(nextFollowUp(done, new Set(), true, at(1.9))).toBeNull();
  });
  it("sends each stage once, inside its window", () => {
    expect(nextFollowUp(done, new Set(), true, at(2))?.kind).toBe("followup_2");
    expect(nextFollowUp(done, new Set(["followup_2"]), true, at(4))).toBeNull();
    expect(nextFollowUp(done, new Set(["followup_2"]), true, at(5.5))?.kind).toBe("followup_5");
    expect(nextFollowUp(done, new Set(["followup_2", "followup_5"]), true, at(9))?.kind).toBe("followup_9");
    expect(nextFollowUp(done, new Set(["followup_2", "followup_5", "followup_9"]), true, at(10))).toBeNull();
  });
  it("skips the case-study email while no case study exists", () => {
    expect(nextFollowUp(done, new Set(["followup_2"]), false, at(5.5))).toBeNull();
    expect(nextFollowUp(done, new Set(["followup_2"]), false, at(9))?.kind).toBe("followup_9");
  });
  it("never sends a stale stage after its window", () => {
    expect(nextFollowUp(done, new Set(), true, at(5.1))?.kind).toBe("followup_5");
    expect(nextFollowUp(done, new Set(), true, at(13))).toBeNull();
  });
});

import { buildReport } from "../../lib/scorecard/report";
import { translateReport } from "../../lib/scorecard/report";
import { followUpEmail } from "../../lib/email/templates";
import { uniformAnswers } from "./fixtures";

describe("follow-up emails", () => {
  const en = buildReport(uniformAnswers(1, { P1: "Order <entry>" }), { firstName: "Anna" });
  const links = { report: "https://example.test/r", unsubscribe: "https://example.test/u?a=1&b=2" };
  it.each(["en", "hu"] as const)("carry an unsubscribe link and header (%s)", locale => {
    const r = locale === "hu" ? translateReport(en, uniformAnswers(1, { P1: "Order <entry>" }), "hu") : en;
    for (const kind of ["followup_2", "followup_9"] as const) {
      const email = followUpEmail(kind, r, links);
      expect(email.html).toContain('href="https://example.test/u?a=1&amp;b=2"');
      expect(email.text).toContain(links.unsubscribe);
      expect(email.headers["List-Unsubscribe"]).toBe(`<${links.unsubscribe}>`);
      expect(email.html).not.toContain("<entry>");
    }
    expect(followUpEmail("followup_2", r, links).text).toContain(r.quickWins[0].action);
    expect(followUpEmail("followup_9", r, links).text).toMatch(locale === "hu" ? /Válaszolj erre az e-mailre/ : /Reply to this email/);
    expect(followUpEmail("followup_9", r, { ...links, booking: "https://cal.example/x" }).html).toContain("https://cal.example/x");
  });
  it("refuses the case-study email without a case study", () => {
    expect(() => followUpEmail("followup_5", en, links)).toThrow();
  });
});
