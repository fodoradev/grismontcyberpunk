import { expect, test } from "@playwright/test";

const pages = [
  { href: "/courses", title: "Online courses." },
  { href: "/downloads", title: "Digital downloads." },
  { href: "/work/case-studies", title: "Case studies." },
  { href: "/work/apps", title: "Apps I’ve built." },
];

test("future content is labelled and discoverable only through the footer", async ({ page }) => {
  await page.goto("/");
  const upcoming = page.getByRole("navigation", { name: "Coming soon", exact: true });
  await expect(upcoming.getByText("Coming soon", { exact: true })).toBeVisible();
  for (const item of pages) {
    await expect(upcoming.locator(`a[href="${item.href}"]`)).toHaveCount(1);
    await expect(page.locator(`header a[href="${item.href}"], main a[href="${item.href}"]`)).toHaveCount(0);
  }
  await upcoming.getByRole("link", { name: "Online courses", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Online courses.");
  await page.getByRole("link", { name: "Explore current services" }).click();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(page.locator("#services")).toBeVisible();
});

for (const width of [320, 1440]) {
  test(`upcoming pages explain their status and fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const item of pages) {
      const response = await page.goto(item.href);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/coming soon.*Grismont/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.title);
      await expect(page.locator("main").getByText("Coming soon", { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Explore current services" })).toHaveAttribute("href", "/#services");
      await expect(page.getByRole("link", { name: "Or start with the free scorecard" })).toHaveAttribute("href", "/scorecard");
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.goto("/courses");
    await page.screenshot({ path: `/tmp/grismont-coming-soon-${width}.png`, fullPage: true });
  });
}
