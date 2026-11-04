import { existsSync, readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const shots = process.env.SHOTS_DIR;
const shot = async (page: Page, name: string) => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true }); };

async function intake(page: Page, email: string) {
  await page.goto("/scorecard");
  await page.getByLabel("First name").fill("Anna");
  await page.getByLabel("Work email").fill(email);
  await page.getByRole("checkbox", { name: /privacy notice/ }).check();
  await page.getByRole("checkbox", { name: /reminders/ }).check();
  await shot(page, "1-intake");
  await page.getByRole("button", { name: /Start the questions/ }).click();
  await expect(page).toHaveURL(/\/scorecard\/s\//);
}

const cardNumber = (page: Page) => page.locator(".sc-card-n").textContent();

/** Presses a key and waits for the next card to appear. */
async function pressAndAdvance(page: Page, key: string) {
  const before = await cardNumber(page);
  await page.keyboard.press(key);
  await expect.poll(() => cardNumber(page)).not.toBe(before);
}

test("intake validates required fields", async ({ page }) => {
  await page.goto("/scorecard");
  await page.getByRole("button", { name: /Start the questions/ }).click();
  await expect(page.getByText("Please tell us your first name.")).toBeVisible();
  await expect(page.getByText("Please confirm you've read the privacy notice.")).toBeVisible();
});

test("a consent tick made while a failed submit is returning survives", async ({ page }) => {
  await page.route("**/scorecard", async route => {
    if (route.request().method() === "POST") await new Promise(resolve => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.goto("/scorecard");
  const consent = page.getByRole("checkbox", { name: /privacy notice/ });
  await page.getByRole("button", { name: /Start the questions/ }).click();
  await consent.check();
  await expect(page.getByText("Please tell us your first name.")).toBeVisible();
  await expect(consent).toBeChecked();
});

test("keyboard flow: process, numbers, back, resume, submit, report, PDF, email", async ({ page }) => {
  await intake(page, `e2e-${Date.now()}@example.test`);

  // Card 1: the process. Enter on an empty field is refused.
  await expect(page.getByRole("heading", { name: /Which one should it be/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Type an answer to continue.")).toBeVisible();
  await page.keyboard.type("Customer quotes");
  await shot(page, "2-process");
  await pressAndAdvance(page, "Enter");

  // The process is piped into the next question; Enter without an answer is refused.
  await expect(page.locator(".sc-pipe").first()).toHaveText("customer quotes"); // lowercased mid-sentence
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Choose an answer to continue: press 1–5/)).toBeVisible();

  // A number key picks the option and moves on.
  await pressAndAdvance(page, "2");
  await expect(page.locator(".sc-card-n")).toHaveText("2");
  await expect(page.locator(".sc-progress-count")).toContainText("Question 2 of 30");
  await expect(page.locator(".sc-save-state")).toHaveText("Saved");
  await shot(page, "3-choice");

  // Backspace and ← go back with the earlier answer still selected; → moves on again.
  await pressAndAdvance(page, "Backspace");
  await expect(page.getByRole("radio", { checked: true })).toContainText("Within 1–2 weeks");
  await pressAndAdvance(page, "ArrowRight");
  await pressAndAdvance(page, "ArrowLeft");
  await pressAndAdvance(page, "Enter");

  // Answer through the first area, then reload: we resume at the first unanswered question.
  for (let i = 0; i < 4; i++) await pressAndAdvance(page, "2");
  const resumeAt = await cardNumber(page);
  await page.waitForTimeout(500); // let the last background save land
  await page.reload();
  await expect(page.locator(".sc-card-n")).toHaveText(resumeAt!);

  // Everything else by keyboard, up to the free-text question.
  while (!(await page.locator("textarea").count())) await pressAndAdvance(page, "3");
  await page.keyboard.type("Three people re-check the same numbers and it still slips.");
  await page.keyboard.press("Enter"); // the closing card has no question number
  await expect(page.getByRole("heading", { name: /That's everything, Anna/ })).toBeVisible();
  // Step 3: optional profile and a separate, unticked marketing consent.
  await expect(page.getByRole("checkbox", { name: /follow-up emails/ })).not.toBeChecked();
  await page.getByLabel("Company size").selectOption("51-250");
  await page.getByLabel("Type of work").selectOption("manufacturing");
  await page.getByRole("checkbox", { name: /follow-up emails/ }).check();
  await shot(page, "4-done");
  await page.getByRole("button", { name: /Show my report/ }).click();

  await expect(page).toHaveURL(/\/scorecard\/r\//, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Anna, here's where you stand." })).toBeVisible();
  await expect(page.getByText("Based on your answers about “Customer quotes”.", { exact: false })).toBeVisible();
  await expect(page.getByText("Three people re-check", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Want help with the first quick win?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Take the Advanced audit/ })).toHaveAttribute("href", "/advanced-audit");
  await shot(page, "5-report");

  const pdf = await page.request.get(page.url() + "/pdf");
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  await expect.poll(() => existsSync(".outbox") ? readdirSync(".outbox").filter(f => f.startsWith("report-")).length : 0, { timeout: 30_000 }).toBeGreaterThan(0);
});

test("mouse flow works too", async ({ page }) => {
  await intake(page, `e2e-mouse-${Date.now()}@example.test`);
  await page.getByRole("textbox").fill("Order to delivery");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("radio", { name: /Within a few days/ }).click();
  await expect(page.locator(".sc-card-n")).toHaveText("2");
  await page.getByRole("button", { name: "Previous question" }).click();
  await expect(page.getByRole("radio", { checked: true })).toContainText("Within a few days");
  await page.getByRole("button", { name: "Next question" }).click();
  await expect(page.locator(".sc-card-n")).toHaveText("2");
});

test("the focused shell keeps one question in view at every viewport, without site navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await intake(page, `e2e-layout-${Date.now()}@example.test`);
  await expect(page.getByRole("textbox")).toBeFocused();
  await expect(page.locator(".gm-nav")).toBeHidden();
  await expect(page.locator(".gm-header-cta")).toBeHidden();
  await expect(page.locator(".gm-footer")).toBeHidden();
  await expect(page.locator("header .gm-wordmark")).toBeVisible();
  await expect(page.locator("header .gm-language")).toBeVisible();
  await page.getByRole("textbox").fill("Order to delivery");
  await pressAndAdvance(page, "Enter");

  const layout = () => page.evaluate(() => {
    const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
    return { progress: rect(".sc-progress-wrap"), choices: rect(".sc-choices"), heading: rect(".sc-card-q"), header: rect("header"), scrollY };
  });
  const check = async () => {
    await expect(page.locator("#sc-q")).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    const g = await layout();
    expect(g.header.top).toBe(0);
    expect(g.heading.top).toBeGreaterThanOrEqual(g.progress.bottom);
    expect(Math.abs(g.choices.left - g.progress.left)).toBeLessThan(2);
    expect(Math.abs(g.choices.right - g.progress.right)).toBeLessThan(2);
  };
  await check();
  await shot(page, "6-question-layout-desktop");

  for (const [width, height, name] of [[820, 1180, "7-question-layout-tablet"], [390, 844, "8-question-layout-mobile"]] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await pressAndAdvance(page, "2");
    await check();
    await shot(page, name);
  }
});

test("one tab stop per question, and the section line appears once an area is finished", async ({ page }) => {
  await intake(page, `e2e-momentum-${Date.now()}@example.test`);
  await page.getByRole("textbox").fill("Order to delivery");
  await pressAndAdvance(page, "Enter");
  await expect(page.locator('.sc-choice[tabindex="0"]')).toHaveCount(1);
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "0 of 30 questions answered");
  for (let i = 0; i < 5; i++) await pressAndAdvance(page, "2");
  await expect(page.locator(".sc-momentum")).toHaveText("Flow and waste done, 5 areas left.");
  await pressAndAdvance(page, "2");
  await expect(page.locator(".sc-momentum")).toHaveCount(0);
});

test("delete flow requires confirmation", async ({ page }) => {
  await intake(page, `e2e-del-${Date.now()}@example.test`);
  const token = page.url().split("/s/")[1];
  await page.goto(`/scorecard/delete/${token}`);
  await expect(page.getByRole("heading", { name: "Delete your scorecard?" })).toBeVisible();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByRole("heading", { name: "Deleted." })).toBeVisible();
  await page.goto(`/scorecard/s/${token}`);
  await expect(page.getByRole("heading", { name: "This link has expired." })).toBeVisible();
});

test("the sample report is labelled fictional and linked from the scorecard page", async ({ page }) => {
  await page.goto("/scorecard");
  await page.getByRole("link", { name: /See a sample report first/ }).click();
  await expect(page).toHaveURL(/\/scorecard\/sample$/);
  await expect(page.getByRole("note")).toContainText("Sample report — fictional company");
  await expect(page.getByRole("heading", { name: "Three quick wins" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Download PDF/ })).toHaveCount(0);
  await page.goto("/hu/scorecard/sample");
  await expect(page.getByRole("note")).toContainText("Mintajelentés — kitalált cég");
});
