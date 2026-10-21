import { expect, test } from "@playwright/test";

test("Advanced Audit landing is linked from the shared footer in both locales", async ({page}) => {
  for (const [path, label, heading] of [["/advanced-audit","Advanced audit","A deeper look at how work gets done."],["/hu/advanced-audit","Részletes audit","A folyamat teljesebb képe."]] as const) {
    await page.setViewportSize({width:390,height:844});
    await page.goto(path);
    await expect(page.getByRole("heading",{name:heading,exact:true})).toBeVisible();
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    expect(overflow,`${path} should not overflow horizontally on mobile`).toBe(false);
    await page.locator("footer").getByRole("link",{name:label,exact:true}).click();
    await expect(page).toHaveURL(new RegExp(path.replaceAll("/","\\/")));
  }
});

test("Advanced Audit saves, resumes, completes, and downloads report formats", async ({page}) => {
  await page.goto("/advanced-audit");
  await page.getByRole("button",{name:"Start the audit"}).click();
  await expect(page).toHaveURL(/\/advanced-audit\/s\/[A-Za-z0-9_-]{22}$/);

  await page.getByRole("textbox").fill("Supplier invoice approval");
  await page.getByRole("button",{name:"OK"}).click();
  await page.getByRole("radio").nth(0).click();
  await expect(page.locator(".sc-card-q")).toContainText("How many times does this process run");
  await page.reload();
  await expect(page.locator(".sc-card-q")).toContainText("How many times does this process run");

  while(!(await page.getByRole("button",{name:"Generate report"}).count())){
    const before=await page.locator(".sc-card-q").textContent();
    if(await page.getByRole("textbox").count()){
      const box=page.getByRole("textbox");
      if(!(await box.inputValue())) await box.fill("Approval delays and duplicate checks");
      await page.getByRole("button",{name:"OK"}).click();
    }else await page.getByRole("radio").first().click();
    await expect.poll(()=>page.locator(".sc-card-q").textContent()).not.toBe(before);
  }

  await expect(page.getByRole("button",{name:"Generate report"})).toBeVisible();
  await page.getByRole("button",{name:"Generate report"}).click();
  await expect(page).toHaveURL(/\/advanced-audit\/r\/[A-Za-z0-9_-]{22}$/,{timeout:30000});
  await expect(page.getByRole("heading",{name:"Supplier invoice approval"})).toBeVisible();

  const base=page.url();
  const json=await page.request.get(`${base}/json`);
  expect(json.status()).toBe(200);
  expect(json.headers()["content-type"]).toContain("application/json");
  expect(json.headers()["cache-control"]).toContain("no-store");
  expect(json.headers()["content-disposition"]).toContain("attachment");
  const payload=await json.json();
  expect(payload.schema).toBe("grismont.advanced-audit-report.v1");
  expect(payload.report.answers).toHaveLength(44);
  expect(payload.report.answers[0].answer_text).toBe("Supplier invoice approval");

  const pdf=await page.request.get(`${base}/pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect(pdf.headers()["content-disposition"]).toContain("attachment");
  expect((await pdf.body()).subarray(0,5).toString()).toBe("%PDF-");
});
