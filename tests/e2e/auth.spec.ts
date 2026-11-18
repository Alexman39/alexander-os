import { expect, test } from "@playwright/test";
import { INTRUDER_STATE, OWNER_SIGNOUT_STATE } from "./auth-constants";

test.describe("signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("every module redirects to sign-in, keeping the destination", async ({ page }) => {
    for (const path of ["/", "/library", "/intelligence", "/assistant", "/settings", "/work"]) {
      await page.goto(path);
      await expect(page).toHaveURL(
        path === "/" ? /\/sign-in$/ : new RegExp(`/sign-in\\?next=${encodeURIComponent(path)}`),
      );
    }
  });

  test("sign-in page offers GitHub only and explains it is private", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /Alexander\s*OS/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with GitHub" })).toBeVisible();
    await expect(page.getByText(/No other account can access this system/)).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveCount(0); // no password fields
  });

  test("shows a clear message when a non-owner tried to sign in", async ({ page }) => {
    await page.goto("/sign-in?error=NOT_OWNER");
    await expect(page.getByRole("main").getByRole("alert")).toContainText("isn't the owner");
  });

  test("auth API refuses email/password sign-up", async ({ request }) => {
    const res = await request.post("/api/auth/sign-up/email", {
      data: { email: "x@example.com", password: "password1234", name: "x" },
    });
    expect(res.ok()).toBe(false);
  });
});

test.describe("non-owner session", () => {
  test.use({ storageState: INTRUDER_STATE });

  test("is rejected and revoked", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/sign-in\?error=NOT_OWNER/);
    await expect(page.getByRole("main").getByRole("alert")).toContainText("isn't the owner");
    // The session was deleted server-side, so the next visit is simply signed out.
    await page.goto("/library");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  });
});

test.describe("owner session", () => {
  test("can open the app and sees their account", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL("/settings");
    await expect(page.getByText("E2E owner")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });
});

test.describe("sign out", () => {
  test.use({ storageState: OWNER_SIGNOUT_STATE });

  test("ends the session and locks the app again", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
