import { afterEach, describe, expect, it, vi } from "vitest";
import { appUrl, urls } from "../../lib/scorecard/delivery";

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
});
