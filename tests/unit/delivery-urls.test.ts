import { afterEach, describe, expect, it, vi } from "vitest";
import { appUrl, urls } from "../../lib/scorecard/delivery";
import { advancedAuditResumeUrl } from "../../lib/advanced-audit/delivery";
import { advancedAuditResumeEmail } from "../../lib/email/templates";

afterEach(() => vi.unstubAllEnvs());

describe("localized private email links", () => {
  it("uses the configured public domain for every bearer link in either language", () => {
    vi.stubEnv("APP_URL", "https://grismont.hu/");
    expect(appUrl()).toBe("https://grismont.hu");
    for (const [kind, segment] of [["resume", "s"], ["report", "r"], ["delete", "delete"]] as const) {
      expect(urls[kind]("private-token")).toBe(`https://grismont.hu/scorecard/${segment}/private-token`);
      expect(urls[kind]("private-token", "hu")).toBe(`https://grismont.hu/hu/scorecard/${segment}/private-token`);
    }
  });

  it("keeps local development links local and uses the selected production domain as the final fallback", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(appUrl()).toBe("http://127.0.0.1:3100");
    vi.stubEnv("NODE_ENV", "production");
    expect(appUrl()).toBe("https://grismont.hu");
  });

  it("builds locale-aware Advanced Audit links and escapes them in the resume email", () => {
    vi.stubEnv("APP_URL", "https://grismont.hu");
    expect(advancedAuditResumeUrl("private-token", "en")).toBe("https://grismont.hu/advanced-audit/s/private-token");
    expect(advancedAuditResumeUrl("private-token", "hu")).toBe("https://grismont.hu/hu/advanced-audit/s/private-token");
    const email = advancedAuditResumeEmail("https://example.test/a?x=1&y=2", "https://example.test/privacy?a=1&b=2", "en");
    expect(email.subject).toContain("Advanced Audit");
    expect(email.html).toContain("https://example.test/a?x=1&amp;y=2");
    expect(email.text).toContain("https://example.test/a?x=1&y=2");
    expect(email.html).toContain("Privacy notice");
  });
});
