import { expect, test } from "@playwright/test";

test.describe("mobile layout", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 1440) >= 1024, "mobile-only checks");

  test("bottom dock + More sheet reach every module, without horizontal scroll", async ({ page, viewport }) => {
    for (const path of ["/", "/library", "/intelligence", "/assistant", "/settings"]) {
      await page.goto(path);
      // innerWidth growing beyond the device width means mobile Chrome zoomed out to fit overflow.
      const m = await page.evaluate(() => ({ inner: window.innerWidth, scroll: document.documentElement.scrollWidth }));
      expect(m.inner, `layout viewport widened on ${path}`).toBe(viewport!.width);
      expect(m.scroll, `horizontal overflow on ${path}`).toBeLessThanOrEqual(viewport!.width);
    }
    await page.goto("/");
    const dock = page.getByRole("navigation", { name: "Modules" }).last();
    await dock.getByRole("link", { name: "Library" }).click();
    await expect(page).toHaveURL("/library");
    await dock.getByRole("button", { name: "More" }).click();
    await page.getByRole("dialog", { name: "All modules" }).getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
  });

  test("assistant context moves into a sheet", async ({ page }) => {
    await page.goto("/assistant");
    await page.getByRole("button", { name: /Context \(4\)/ }).click();
    await expect(page.getByRole("dialog", { name: "Context & permissions" }).getByText("Records in use · 4")).toBeVisible();
  });

  test("assistant does not scroll the page on load", async ({ page }) => {
    await page.goto("/assistant");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});
