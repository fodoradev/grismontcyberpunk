import { expect, test } from "@playwright/test";

test("the alternative illustration runs with twelve dots and no removed labels", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const art = page.locator(".home-art");
  await expect(art).not.toContainText("Fig. 01");
  await expect(art).not.toContainText("FOLLOW THE WORK");
  const dots = art.locator(".home-art-moving-dots circle");
  await expect(dots).toHaveCount(12);
  await expect.poll(() => art.locator('.home-art-moving-dots circle[fill="#D5F36B"]').count()).toBeGreaterThan(0);
  const before = await dots.first().getAttribute("cx");
  await expect.poll(() => dots.first().getAttribute("cx")).not.toBe(before);
  await art.screenshot({ path: "/tmp/grismont-flow-alternative.png" });
  await page.locator(".home-hero").screenshot({ path: "/tmp/grismont-sticky-note-hero.png" });
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
  const dot = moving.locator("circle").first();
  const before = await dot.getAttribute("cx");
  await expect.poll(() => dot.getAttribute("cx")).not.toBe(before);
});

test("the live stream recoils, occasionally pauses, and starts moving again", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-20T10:00:00Z") });
  await page.goto("/");
  const art = page.locator(".home-art");
  const dots = art.locator(".home-art-moving-dots circle");
  await expect(dots.first()).toHaveAttribute("data-flow-state", /moving|recoil|waiting/);
  // Navigation/hydration can take over a second when other browser checks run in parallel.
  await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 1_000);
  const states = new Set<string>();
  let pausedDot: number | undefined;
  let recovered = false;
  let minimumSpacing = Infinity;
  const completed = new Set<number>();
  for (let i = 0; i < 450; i++) {
    await page.clock.runFor(100);
    const current = await dots.evaluateAll(elements => elements.map(el => el.getAttribute("data-flow-state")!));
    expect(current.filter(state => state !== "clear" && state !== "pending").length).toBeLessThanOrEqual(12);
    current.forEach((state, index) => { states.add(state); if (state === "clear") completed.add(index); });
    const positions = await dots.evaluateAll(elements => elements.filter(el => el.getAttribute("fill") === "#A7ACA8").map(el => ({ x: Number(el.getAttribute("cx")), y: Number(el.getAttribute("cy")) })).filter(p => p.x > 0 && p.x < 240));
    for (let a = 0; a < positions.length; a++) for (let b = a + 1; b < positions.length; b++) minimumSpacing = Math.min(minimumSpacing, Math.hypot(positions[a].x - positions[b].x, positions[a].y - positions[b].y));
    if (pausedDot === undefined && current.includes("stalled")) pausedDot = current.indexOf("stalled");
    if (pausedDot !== undefined && current[pausedDot] === "moving") recovered = true;
  }
  expect(states.has("recoil")).toBe(true);
  expect(states.has("stalled")).toBe(true);
  expect(recovered).toBe(true);
  expect(minimumSpacing).toBeGreaterThan(16);
  expect(completed.size).toBe(12);
  await art.screenshot({ path: "/tmp/grismont-flow-after-encounters.png" });
});
