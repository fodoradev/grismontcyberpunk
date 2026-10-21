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
