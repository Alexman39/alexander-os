import { expect, test, type Page } from "@playwright/test";

/** Global shortcuts attach after hydration; the provider marks <html> once mounted. */
async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await page.locator("html[data-ambient]").waitFor({ state: "attached" });
}

test.describe("shell & navigation", () => {
  test("every module is reachable from the crossbar", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Modules" }).first();
    for (const [label, path] of [
      ["Library", "/library"],
      ["Intelligence", "/intelligence"],
      ["Assistant", "/assistant"],
      ["Settings", "/settings"],
      ["Work", "/work"],
      ["Home", "/"],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    }
  });

  test("crossbar supports arrow keys with a single tab stop", async ({ page }) => {
    await gotoHydrated(page, "/");
    const nav = page.getByRole("navigation", { name: "Modules" }).first();
    const home = nav.getByRole("link", { name: "Home", exact: true });
    await expect(home).toHaveAttribute("tabindex", "0");
    await expect(nav.getByRole("link", { name: "Library", exact: true })).toHaveAttribute("tabindex", "-1");
    await home.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await expect(nav.getByRole("link", { name: "Library", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/library");
    await expect(page.getByRole("heading", { level: 1, name: "Library" })).toBeVisible();
  });

  test("[ and ] move between modules", async ({ page }) => {
    await gotoHydrated(page, "/library");
    await page.locator("body").press("]");
    await expect(page).toHaveURL("/intelligence");
    await page.locator("body").press("[");
    await expect(page).toHaveURL("/library");
  });

  test("command palette navigates by keyboard", async ({ page }) => {
    await gotoHydrated(page, "/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox", { name: "Search commands" });
    await expect(input).toBeFocused();
    await input.fill("assist");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/assistant");
  });

  test("quick capture saves to the session inbox", async ({ page }) => {
    await gotoHydrated(page, "/");
    await page.locator("body").press("c");
    const field = page.getByLabel("What do you want to capture?");
    await expect(field).toBeFocused();
    await field.fill("Email landlord about deposit");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").getByText(/Captured task/)).toBeVisible();
    await expect(page.getByText("Email landlord about deposit")).toBeVisible();
  });

  test("Escape closes dialogs and skip link targets main", async ({ page }) => {
    await gotoHydrated(page, "/");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });
});

test.describe("home", () => {
  test("labels demo data and previews tile states", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Demo mode")).toBeVisible();
    await page.getByRole("radio", { name: "error" }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.getByRole("radio", { name: "empty" }).click();
    await expect(page.getByText(/No focus tasks/)).toBeVisible();
    await page.getByRole("radio", { name: "demo" }).click();
    await expect(page.getByText("Finish literature review outline")).toBeVisible();
  });

  test("focus tasks toggle", async ({ page }) => {
    await page.goto("/");
    const box = page.getByRole("checkbox", { name: /Finish literature review outline/ });
    await expect(box).not.toBeChecked();
    await box.check({ force: true });
    await expect(box).toBeChecked();
  });

  test("ask assistant hands the prompt over", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "What's due this week?" }).click();
    await expect(page).toHaveURL(/\/assistant\?q=/);
    await expect(page.getByRole("button", { name: /Source T-12/ }).first()).toBeVisible();
  });
});

test.describe("library", () => {
  test("cover opens detail blade; ownership and status are independent", async ({ page }) => {
    await page.goto("/library");
    await page.getByRole("button", { name: /^Outer Wilds, Game/ }).click();
    const dialog = page.getByRole("dialog", { name: "Outer Wilds" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Wishlist" }).click();
    await expect(dialog.getByRole("button", { name: "Wishlist" })).toHaveAttribute("aria-pressed", "true");
    await expect(dialog.getByRole("button", { name: "In progress" })).toHaveAttribute("aria-pressed", "true");
    await dialog.getByRole("radio", { name: "4 stars" }).click();
    await expect(dialog.getByText("4/5")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("arrow keys move across shelves and update the stage", async ({ page }) => {
    await page.goto("/library");
    const first = page.getByRole("button", { name: /^Designing Data-Intensive Applications, Book/ });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: /^Outer Wilds, Game/ })).toBeFocused();
    await expect(page.getByRole("region", { name: "Selected item" }).getByRole("heading", { name: "Outer Wilds" })).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[data-shelf="1"][data-index="1"]')).toBeFocused();
  });

  test("type blades and search filter shelves", async ({ page }) => {
    await page.goto("/library");
    await page.getByRole("tab", { name: /Films/ }).click();
    await expect(page.getByRole("button", { name: /, Book by/ })).toHaveCount(0);
    await page.getByLabel("Search library").fill("zzz");
    await expect(page.getByText("No matches on these shelves.")).toBeVisible();
  });
});

test.describe("intelligence", () => {
  test("lead event shows provenance and relevance breakdown", async ({ page }) => {
    await page.goto("/intelligence");
    await page.getByRole("button", { name: /Evidence, sources & feedback/ }).first().click();
    await expect(page.getByText(/Relevance breakdown · 89\/100/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Demo Lab Blog/ })).toHaveAttribute("href", /example\.com/);
  });

  test("feedback and interest toggles change the feed", async ({ page }) => {
    await page.goto("/intelligence");
    await expect(page.getByText("7 events")).toBeVisible();
    await page.getByRole("switch", { name: "Monitor Cybersecurity" }).click();
    await expect(page.getByText("6 events")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(page.getByText("5 events")).toBeVisible();
    await page.getByRole("button", { name: /Restore 1 dismissed/ }).click();
    await expect(page.getByText("6 events")).toBeVisible();
  });
});

test.describe("assistant", () => {
  test("write actions wait for approval", async ({ page }) => {
    await page.goto("/assistant");
    const card = page.getByRole("group", { name: /Proposed action/ });
    await expect(card.getByText("Write · needs approval")).toBeVisible();
    await card.getByRole("button", { name: "Approve" }).click();
    await expect(card.getByText(/nothing was written or sent/)).toBeVisible();
    await expect(page.getByText(/Approved create_task/)).toBeVisible();
  });

  test("external send_email is flagged and can be declined", async ({ page }) => {
    await page.goto("/assistant");
    await page.getByRole("button", { name: /Email supervisor/ }).click();
    const card = page.getByRole("group", { name: /Proposed action: Send email/ });
    await expect(card.getByText("External · needs approval")).toBeVisible();
    await card.getByRole("button", { name: "Decline" }).click();
    await expect(card.getByText(/no action taken/)).toBeVisible();
  });

  test("suggested prompt yields a cited reply; free text is honest about demo mode", async ({ page }) => {
    await page.goto("/assistant");
    await page.getByRole("button", { name: "Summarise today's intelligence" }).click();
    await expect(page.getByRole("button", { name: /Source EV-101/ })).toBeVisible();
    await page.getByLabel("Message the assistant").fill("hello");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/no language model is connected/)).toBeVisible();
  });
});

test.describe("motion", () => {
  test("reduced motion removes live-tile auto-rotation controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Pause rotation" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Next item" }).first()).toBeVisible();
  });

  test("settings motion preference is applied to the document", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("radio", { name: /Full/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "full");
    await page.getByRole("radio", { name: /Reduced/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await page.getByRole("switch", { name: "Ambient background motion" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-ambient", "off");
  });
});
