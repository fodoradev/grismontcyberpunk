import { expect, test } from "@playwright/test";

test("visitors can explore the problems by keyboard and reach the free scorecard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Get back the hours your team loses to admin.");
  const approval = page.getByRole("button", { name: /The approval loop/ });
  await approval.focus();
  await page.keyboard.press("Enter");
  await expect(approval).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "The approval loop" })).toContainText("The order waits for three signatures");
  await expect(page.getByRole("button", { name: /The weekly report/ })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: /The AI idea/ }).click();
  await expect(page.getByRole("region", { name: "The AI idea" })).toContainText("Test for 2 weeks");
  await page.locator("#scorecard summary").first().click();
  await expect(page.getByText("Where does work wait, repeat or get passed back?")).toBeVisible();
  await page.getByRole("link", { name: "Start the scorecard", exact: true }).first().click();
  await expect(page).toHaveURL(/\/scorecard$/);
  await expect(page.getByLabel("First name", { exact: true })).toBeVisible();
});

test("section numbers, prices and links resolve; no placeholders leak", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main .gm-label").filter({ hasText: /^\d\d \/ / })).toHaveText(["01 / The problems", "02 / Training & services", "03 / How I work", "04 / The free scorecard", "05 / About"]);
  await expect(page.locator("#training .home-price strong")).toHaveText("320 000 Ft");
  const unresolved = await page.locator("a[href*='#']").evaluateAll(links => links.map(link => link.getAttribute("href")!).filter(href => href.startsWith("#") || href.startsWith("/#")).filter(href => !document.getElementById(href.split("#")[1])));
  expect(unresolved).toEqual([]);
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\{\{|\[To be|Coming soon/);
});

test("a service card preselects the interest and the contact form sends", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Book a workshop" }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByRole("radio", { name: "Workshop" })).toBeChecked();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact input[name=name]")).toBeFocused();
  await expect(page.locator("#contact")).toContainText("Please tell me your name.");
  await page.locator("#contact input[name=name]").fill("E2E Tester");
  await page.locator("#contact input[name=email]").fill(`e2e-contact-${Date.now()}@example.test`);
  await page.locator("#contact textarea[name=message]").fill("Our weekly production report takes a full day.");
  await page.getByRole("checkbox", { name: /privacy notice/ }).check();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("I will reply within one working day.");
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (width < 1001) {
      const menu = page.locator(".gm-mobile-menu");
      await menu.getByText("Menu", { exact: true }).click();
      await expect(menu).toHaveAttribute("open", "");
      await menu.getByRole("link", { name: "Training & services", exact: true }).click();
      await expect(menu).not.toHaveAttribute("open");
      await expect(page).toHaveURL(/#services$/);
    }
    await page.goto("/scorecard");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
