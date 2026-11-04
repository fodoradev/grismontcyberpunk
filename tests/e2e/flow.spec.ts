import { expect, test } from "@playwright/test";

const CLEAR = "#35F0D8";
const WAITING = "#FF2E54";

test("the method illustration runs with twelve dots and no removed labels", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const art = page.locator(".home-art");
  await art.scrollIntoViewIfNeeded();
  await expect(art).not.toContainText("Fig. 01");
  await expect(art).not.toContainText("FOLLOW THE WORK");
  const dots = art.locator(".home-art-moving-dots circle");
  await expect(dots).toHaveCount(12);
  await expect.poll(() => art.locator(`.home-art-moving-dots circle[fill="${CLEAR}"]`).count()).toBeGreaterThan(0);
  const before = await dots.first().getAttribute("cx");
  await expect.poll(() => dots.first().getAttribute("cx")).not.toBe(before);
  expect(errors).toEqual([]);
});

test("reduced motion shows the static illustration and pauses the simulation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const moving = page.locator(".home-art-moving-dots");
  const still = page.locator(".home-art-static-dots");
  await expect(moving).toBeHidden();
  await expect(still).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(still).toBeHidden();
  await expect(moving).toBeVisible();
  await moving.scrollIntoViewIfNeeded();
  const dot = moving.locator("circle").first();
  const before = await dot.getAttribute("cx");
  await expect.poll(() => dot.getAttribute("cx")).not.toBe(before);
});

test("the stream keeps its spacing, plays once, then rests on the static picture", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-20T10:00:00Z") });
  await page.goto("/");
  const art = page.locator(".home-art");
  await art.scrollIntoViewIfNeeded();
  const dots = art.locator(".home-art-moving-dots circle");
  await expect(dots.first()).toHaveAttribute("data-flow-state", /moving|recoil|waiting/);
  // Navigation/hydration can take over a second when other browser checks run in parallel.
  await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1_000);
  const states = new Set<string>();
  let minimumSpacing = Infinity;
  for (let i = 0; i < 100; i++) {
    await page.clock.runFor(100);
    const current = await dots.evaluateAll(elements => elements.map(el => el.getAttribute("data-flow-state")!));
    current.forEach(state => states.add(state));
    const positions = await dots.evaluateAll((elements, waiting) => elements.filter(el => el.getAttribute("fill") === waiting).map(el => ({ x: Number(el.getAttribute("cx")), y: Number(el.getAttribute("cy")) })).filter(p => p.x > 0 && p.x < 240), WAITING);
    for (let a = 0; a < positions.length; a++) for (let b = a + 1; b < positions.length; b++) minimumSpacing = Math.min(minimumSpacing, Math.hypot(positions[a].x - positions[b].x, positions[a].y - positions[b].y));
  }
  expect(states.has("clear")).toBe(true);
  expect(minimumSpacing).toBeGreaterThan(16);
  await expect(art.locator("svg")).not.toHaveAttribute("data-flow-settled");
  await page.clock.runFor(4_000);
  await expect(art.locator("svg")).toHaveAttribute("data-flow-settled", "");
  await expect(art.locator(".home-art-moving-dots")).toBeHidden();
  await expect(art.locator(".home-art-static-dots")).toBeVisible();
});
