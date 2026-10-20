import { expect, test } from "@playwright/test";

test("visitors can explore examples by keyboard and reach the free scorecard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Good work.Fewer tangles.");
  const approval = page.getByRole("button", { name: /The approval loop/ });
  await approval.focus();
  await page.keyboard.press("Enter");
  await expect(approval).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "The approval loop" })).toContainText("Who can say yes");
  await expect(page.getByRole("button", { name: /The weekly report/ })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: /The AI idea/ }).click();
  await expect(page.getByRole("region", { name: "The AI idea" })).toContainText("who checks it?");
  await page.locator("#scorecard summary").first().click();
  await expect(page.getByText("Where does work wait, repeat or get passed back?")).toBeVisible();
  await page.getByRole("link", { name: "Start your free scorecard" }).click();
  await expect(page).toHaveURL(/\/scorecard$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("One process. A clearer next step.");
  await expect(page.getByLabel("First name", { exact: true })).toBeVisible();
});

test("contact links have real destinations and section links resolve", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#contact").getByRole("link", { name: "hello@grismont.hu" })).toHaveAttribute("href", "mailto:hello@grismont.hu");
  await expect(page.getByRole("link", { name: "Discuss a workshop" })).toHaveAttribute("href", "mailto:hello@grismont.hu?subject=Workshops%20enquiry");
  const unresolved = await page.locator("a[href*='#']").evaluateAll(links => links.map(link => link.getAttribute("href")!).filter(href => href.startsWith("#") || href.startsWith("/#")).filter(href => !document.getElementById(href.split("#")[1])));
  expect(unresolved).toEqual([]);
  await expect(page.locator("main")).not.toContainText("[Free / price]");
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
      await menu.getByText("Explore Grismont", { exact: true }).click();
      await expect(menu).toHaveAttribute("open", "");
      await menu.getByRole("link", { name: "The work", exact: true }).click();
      await expect(menu).not.toHaveAttribute("open");
      await expect(page).toHaveURL(/#services$/);
    }
    await page.goto("/");
    await page.screenshot({ path: `/tmp/grismont-home-${width}.png`, fullPage: true });
    await page.goto("/scorecard");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
