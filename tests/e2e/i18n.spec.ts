import { expect, test, type APIResponse, type Page } from "@playwright/test";

const publicPages = [
  { path: "", title: "Szerezd vissza az órákat, amelyeket a csapatod adminisztrációval tölt." },
  { path: "/privacy", title: "Adatkezelés." },
  { path: "/cookies", title: "Sütik." },
  { path: "/impressum", title: "Impresszum." },
  { path: "/scorecard", title: "Egy folyamat. Egy tisztább következő lépés." },
];

const language = (page: Page) => page.locator("header .gm-language");

async function noOverflow(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    overflowing: Array.from(document.querySelectorAll("main *, header *, footer *"))
      .filter(element => element.getBoundingClientRect().right > 320.1)
      .slice(0, 8).map(element => ({ tag: element.tagName, class: element.className, text: element.textContent?.slice(0, 100) })),
  }));
  expect.soft(layout.width, `${page.url()}: ${JSON.stringify(layout.overflowing)}`).toBeLessThanOrEqual(320);
}

async function advance(page: Page, key: string) {
  const before = await page.locator(".sc-card-n").textContent();
  await page.keyboard.press(key);
  await expect.poll(() => page.locator(".sc-card-n").textContent()).not.toBe(before);
}

async function startHungarianScorecard(page: Page) {
  await page.goto("/hu/scorecard");
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await page.getByLabel("Keresztnév", { exact: true }).fill("Ágnes");
  await page.getByLabel("Munkahelyi e-mail", { exact: true }).fill(`e2e-hu-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`);
  await page.getByRole("checkbox", { name: /adatkezelési tájékoztatót/ }).check();
  await page.getByRole("button", { name: "Kezdjük a kérdéseket" }).click();
  await expect(page).toHaveURL(/\/hu\/scorecard\/s\//);
  await expect(page.getByRole("textbox")).toBeFocused();
  return page.url();
}

function privateHeaders(response: APIResponse) {
  const headers = response.headers();
  expect(headers["cache-control"]).toMatch(/\bno-store\b/);
  expect(headers["cache-control"]).not.toMatch(/\bpublic\b/);
  expect(headers["referrer-policy"]).toBe("no-referrer");
  expect(headers["x-robots-tag"]).toMatch(/\bnoindex\b/);
  expect(headers["x-robots-tag"]).toMatch(/\bnofollow\b/);
}

for (const item of [
  { path: "/privacy", spoof: "hu", locale: "en", title: "Privacy." },
  { path: "/hu/privacy", spoof: "en", locale: "hu", title: "Adatkezelés." },
]) {
  test(`request locale follows URL despite spoofed headers: ${item.path}`, async ({ request }) => {
    const response = await request.get(item.path, { headers: { "x-site-locale": item.spoof } });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html.match(/<html[^>]* lang="([^"]+)"/)?.[1]).toBe(item.locale);
    expect(html.match(/<h1[^>]*>([^<]*)<\/h1>/)?.[1]).toBe(item.title);
  });
}

for (const item of [{ path: "/human", locale: "en" }, { path: "/hu/missing", locale: "hu" }]) {
  test(`unknown route returns localized 404: ${item.path}`, async ({ request }) => {
    const response = await request.get(item.path);
    expect(response.status()).toBe(404);
    const html = await response.text();
    expect(html.match(/<html[^>]* lang="([^"]+)"/)?.[1]).toBe(item.locale);
  });
}

test("Hungarian aliases do not expose API endpoints", async ({ request }) => {
  const response = await request.get("/hu/api/cron/daily");
  expect(response.status()).toBe(404);
});

test("invalid HU resume response has no-store, no-referrer and nofollow headers", async ({ request }) => {
  const response = await request.get("/hu/scorecard/s/invalid");
  expect(response.status()).toBe(200);
  privateHeaders(response);
  const html = await response.text();
  expect(html.match(/<html[^>]* lang="([^"]+)"/)?.[1]).toBe("hu");
  expect(html.match(/<h1[^>]*>([^<]*)<\/h1>/)?.[1]).toBe("Ez a hivatkozás már nem érvényes.");
});

test("missing HU report PDF returns localized 404 with private headers", async ({ request }) => {
  const response = await request.get("/hu/scorecard/r/invalid/pdf");
  expect(response.status()).toBe(404);
  privateHeaders(response);
  expect(await response.text()).toBe("Nem található");
});

for (const item of publicPages) {
  test(`HU ${item.path || "/"}: localized content, links, language switch and no overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(`/hu${item.path}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", "hu");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
    await expect(language(page).locator('[aria-current="true"]')).toHaveText("HU");
    await expect(language(page).getByRole("link", { name: "English", exact: true })).toBeVisible();
    await expect(page.locator("footer").getByRole("link", { name: "hello@grismont.hu", exact: true })).toHaveAttribute("href", "mailto:hello@grismont.hu");
    // All ordinary internal links keep visitors in Hungarian; the language switch is the exception.
    const englishLinks = await page.locator("header a, main a, footer a").evaluateAll(links => links
      .filter(link => !link.closest(".gm-language"))
      .map(link => link.getAttribute("href") ?? "")
      .filter(href => href.startsWith("/") && !/^\/hu(?:\/|#|\?|$)/.test(href)));
    expect(englishLinks).toEqual([]);
    await noOverflow(page);
    await language(page).getByRole("link", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${item.path || "/"}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(language(page).locator('[aria-current="true"]')).toHaveText("EN");
    await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/hu${item.path}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "hu");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
  });
}

for (const path of ["/?source=i18n#services", "/privacy?source=i18n#scorecard"]) {
  test(`header switch preserves page, query and hash: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const original = page.url();
    await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
    const translated = new URL(original);
    translated.pathname = translated.pathname === "/" ? "/hu" : `/hu${translated.pathname}`;
    await expect(page).toHaveURL(translated.toString());
    await expect(page.locator("html")).toHaveAttribute("lang", "hu");
    await language(page).getByRole("link", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(original);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
}

test("HU mobile navigation and footer keep the locale", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/hu");
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  const menu = page.locator(".gm-mobile-menu");
  await menu.getByText("Menü", { exact: true }).click();
  await menu.getByRole("link", { name: "Tréningek és szolgáltatások", exact: true }).click();
  await expect(menu).not.toHaveAttribute("open");
  await expect(page).toHaveURL(/\/hu#services$/);
  await expect(page.locator("footer")).not.toContainText("Hamarosan");
  await page.locator("footer").getByRole("link", { name: "Csapattréning", exact: true }).click();
  await expect(page).toHaveURL(/\/hu#training$/);
  expect((await page.request.get("/hu/courses")).status()).toBe(404);
});

test("header switch href follows dynamic section navigation and HU respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const englishNav = page.getByRole("navigation", { name: "Main navigation", exact: true });
  await englishNav.getByRole("link", { name: "Training & services", exact: true }).click();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(language(page).getByRole("link", { name: "Magyar", exact: true })).toHaveAttribute("href", "/hu#services");
  await englishNav.getByRole("link", { name: "How I work", exact: true }).click();
  await expect(language(page).getByRole("link", { name: "Magyar", exact: true })).toHaveAttribute("href", "/hu#method");
  await page.goBack();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(language(page).getByRole("link", { name: "Magyar", exact: true })).toHaveAttribute("href", "/hu#services");
  await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
  await expect(page).toHaveURL(/\/hu#services$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await expect(page.locator(".home-art-moving-dots")).toBeHidden();
  await expect(page.locator(".home-art-static-dots")).toBeVisible();
});

test("HU intake shows localized field errors and retains entered details", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/hu/scorecard");
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await expect(page.getByRole("link", { name: /adatkezelési tájékoztatót/ })).toHaveAttribute("href", "/hu/privacy");
  await page.getByRole("button", { name: "Kezdjük a kérdéseket" }).click();
  for (const message of [
    "Kérlek, add meg a keresztneved.",
    "Kérlek, adj meg egy érvényes e-mail-címet.",
    "Kérlek, erősítsd meg, hogy elolvastad az adatkezelési tájékoztatót.",
  ]) await expect(page.getByText(message, { exact: true })).toBeVisible();
  await expect(page.locator('[name="firstName"]')).toBeFocused();
  // Inline errors become part of each wrapping label after validation.
  await page.getByLabel(/^Keresztnév/).fill("Ágnes");
  await page.getByLabel(/^Munkahelyi e-mail/).fill("invalid-email");
  await page.getByRole("checkbox", { name: /emlékeztetőt/ }).check();
  await page.getByRole("button", { name: "Kezdjük a kérdéseket" }).click();
  await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator('[name="email"]')).toBeFocused();
  await expect(page.locator('[name="firstName"]')).toHaveValue("Ágnes");
  await expect(page.locator('[name="email"]')).toHaveValue("invalid-email");
  await expect(page.locator('[name="reminders"]')).toBeChecked();
  await expect(page.locator('[name="reminders"]')).not.toHaveAttribute("required");
  await noOverflow(page);
});

for (const item of [
  { path: "/s/i18n-invalid-token", title: "Ez a hivatkozás már nem érvényes." },
  { path: "/r/i18n-invalid-token", title: "A riport nem található." },
  { path: "/delete/i18n-invalid-token", title: "Nincs mit törölni." },
]) {
  test(`HU scorecard error ${item.path} is localized and fits at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`/hu/scorecard${item.path}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "hu");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
    await expect(page.getByRole("link", { name: "Folyamat-pontozó indítása" })).toHaveAttribute("href", "/hu/scorecard");
    await noOverflow(page);
  });
}

test("HU scorecard journey saves drafts across language switches, resumes, reports, downloads and deletes", async ({ page }) => {
  // Use the existing scorecard spec's real intake and keyboard flow against the local database.
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const resumeURL = await startHungarianScorecard(page);
  const token = new URL(resumeURL).pathname.split("/s/")[1];
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("A folytatáshoz írj be egy választ.");
  const process = "HR beléptetés";
  await page.getByRole("textbox").fill(process);
  // Switch without pressing OK: the latest text must be saved before navigation.
  await language(page).getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(resumeURL.replace("/hu/", "/"));
  await page.waitForLoadState("load");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Previous question", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue(process);
  await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
  await expect(page).toHaveURL(resumeURL);
  await page.waitForLoadState("load");
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await expect(page.locator(".sc-card-n")).toHaveText("1");
  await expect(page.locator(".sc-pipe").first()).toHaveText(process);
  await page.getByRole("button", { name: "Következő kérdés", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("A folytatáshoz válassz:");
  await noOverflow(page);
  const savedAnswer = page.waitForResponse(response => response.request().method() === "POST" && response.url() === resumeURL && response.ok());
  await advance(page, "2");
  await savedAnswer;
  await page.reload();
  await expect(page.locator(".sc-card-n")).toHaveText("2");
  await page.getByRole("button", { name: "Előző kérdés", exact: true }).click();
  await expect(page.getByRole("radio", { checked: true })).toContainText("1–2 héten belül");
  await advance(page, "Enter");
  // Bound the loop so a regression cannot leave the test answering forever.
  for (let i = 0; i < 40 && !(await page.locator("textarea").count()); i++) {
    await advance(page, "3");
  }
  const draft = "Három ember ellenőrzi ugyanazokat az adatokat.";
  await expect(page.locator("textarea")).toBeVisible();
  await page.locator("textarea").fill(draft);
  await language(page).getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(resumeURL.replace("/hu/", "/"));
  await page.waitForLoadState("load");
  await expect(page.getByRole("heading", { name: "That's everything, Ágnes." })).toBeVisible();
  await page.getByRole("button", { name: "Previous question", exact: true }).click();
  await expect(page.locator("textarea")).toHaveValue(draft);
  await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
  await expect(page).toHaveURL(resumeURL);
  await page.waitForLoadState("load");
  await expect(page.getByRole("heading", { name: "Minden kérdésre válaszoltál, Ágnes." })).toBeVisible();
  await page.getByLabel("Munka jellege").selectOption("manufacturing");
  await page.getByRole("button", { name: /Mutasd az eredményt/ }).click();
  await expect(page).toHaveURL(/\/hu\/scorecard\/r\//, { timeout: 30_000 });
  const reportURL = page.url();
  await expect(page.locator("html")).toHaveAttribute("lang", "hu");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ágnes, itt tartasz most.");
  await expect(page.locator(".sc-report-head")).toContainText(process);
  await expect(page.locator("blockquote")).toContainText(draft);
  await expect(page.getByRole("heading", { name: "Hat terület, egy átfogó kép" })).toBeVisible();
  await expect(page.locator(".sc-profile [role='cell']").first()).toContainText(/\d,\d/);
  await noOverflow(page);
  const quadrant = await page.locator(".sc-quadrant figure svg").evaluate(svg => {
    const view = (svg as SVGSVGElement).viewBox.baseVal;
    return {
      bounds: { x: view.x, y: view.y, right: view.x + view.width, bottom: view.y + view.height },
      labels: Array.from(svg.querySelectorAll("text"), text => {
        const box = text.getBBox();
        return { text: text.textContent, x: box.x, y: box.y, right: box.x + box.width, bottom: box.y + box.height };
      }),
    };
  });
  expect(quadrant.labels).toHaveLength(4);
  for (const label of quadrant.labels) {
    expect(label.x, label.text ?? "").toBeGreaterThanOrEqual(quadrant.bounds.x - 0.1);
    expect(label.y, label.text ?? "").toBeGreaterThanOrEqual(quadrant.bounds.y - 0.1);
    expect(label.right, label.text ?? "").toBeLessThanOrEqual(quadrant.bounds.right + 0.1);
    expect(label.bottom, label.text ?? "").toBeLessThanOrEqual(quadrant.bounds.bottom + 0.1);
  }
  for (let i = 0; i < quadrant.labels.length; i++) {
    for (let j = i + 1; j < quadrant.labels.length; j++) {
      const a = quadrant.labels[i], b = quadrant.labels[j];
      expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y,
        `${a.text} overlaps ${b.text}`).toBe(true);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => document.fonts.ready);
  const trackWidths = await page.locator(".sc-profile-row svg").evaluateAll(tracks => tracks.map(track => track.getBoundingClientRect().width));
  expect(trackWidths).toHaveLength(6);
  expect(Math.min(...trackWidths)).toBeGreaterThan(0);
  expect(Math.max(...trackWidths) - Math.min(...trackWidths)).toBeLessThanOrEqual(0.1);
  await page.setViewportSize({ width: 320, height: 900 });
  const pdfLink = page.getByRole("link", { name: "PDF letöltése" });
  await expect(pdfLink).toHaveAttribute("href", `${new URL(reportURL).pathname}/pdf`);
  const pdf = await page.request.get((await pdfLink.getAttribute("href"))!);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page.goto(`/hu/scorecard/delete/${token}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Törlöd a Folyamat-pontozódat?");
  await noOverflow(page);
  await page.getByRole("button", { name: "Végleges törlés" }).click();
  await expect(page).toHaveURL(/\/hu\/scorecard\/delete\/done$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Törölve.");
  await noOverflow(page);
  await page.goto(reportURL);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("A riport nem található.");
});

test("clearing a previously saved required process blocks language switching and retains the edit", async ({ page }) => {
  const resumeURL = await startHungarianScorecard(page);
  const token = new URL(resumeURL).pathname.split("/s/")[1];
  const englishURL = resumeURL.replace("/hu/", "/");
  // A genuinely new blank answer must still allow a language choice.
  await language(page).getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(englishURL);
  await page.waitForLoadState("load");
  await expect(page.getByRole("textbox")).toHaveValue("");
  await expect(page.getByRole("textbox")).toBeFocused();
  await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
  await expect(page).toHaveURL(resumeURL);
  await page.waitForLoadState("load");
  await expect(page.getByRole("textbox")).toBeFocused();
  await page.getByRole("textbox").fill("HR beléptetés");
  await language(page).getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(englishURL);
  await page.waitForLoadState("load");
  await page.getByRole("button", { name: "Previous question", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("HR beléptetés");
  await page.getByRole("textbox").fill("");
  await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(/.+/);
  await expect(page).toHaveURL(englishURL);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("textbox")).toHaveValue("");
  await page.getByRole("textbox").fill("Árajánlatadás");
  await language(page).getByRole("link", { name: "Magyar", exact: true }).click();
  await expect(page).toHaveURL(resumeURL);
  await expect(page.locator(".sc-pipe").first()).toHaveText("Árajánlatadás");
  await page.goto(`/hu/scorecard/delete/${token}`);
  await page.getByRole("button", { name: "Végleges törlés" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Törölve.");
});
