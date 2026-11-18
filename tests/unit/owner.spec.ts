import { expect, test } from "@playwright/test";
import { isOwnerAccount, safeNextPath } from "../../src/lib/owner";

test.describe("owner rule", () => {
  test("only the configured GitHub account is the owner", () => {
    expect(isOwnerAccount({ providerId: "github", accountId: "89802016" }, "89802016")).toBe(true);
    expect(isOwnerAccount({ providerId: "github", accountId: 89802016 }, "89802016")).toBe(true);
    expect(isOwnerAccount({ providerId: "github", accountId: "1" }, "89802016")).toBe(false);
  });

  test("other providers never qualify, even with the same ID", () => {
    expect(isOwnerAccount({ providerId: "google", accountId: "89802016" }, "89802016")).toBe(false);
    expect(isOwnerAccount({ providerId: "credential", accountId: "89802016" }, "89802016")).toBe(false);
  });

  test("a missing or malformed owner ID grants nobody access", () => {
    expect(isOwnerAccount({ providerId: "github", accountId: "" }, "")).toBe(false);
    expect(isOwnerAccount({ providerId: "github", accountId: "Alexman39" }, "Alexman39")).toBe(false);
  });
});

test.describe("post-sign-in redirect", () => {
  test("keeps same-site paths", () => {
    expect(safeNextPath("/library?focus=L-1")).toBe("/library?focus=L-1");
  });
  test("rejects open redirects and loops", () => {
    for (const bad of [
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/sign-in",
      "/api/auth/x",
      "",
      null,
    ]) {
      expect(safeNextPath(bad)).toBe("/");
    }
  });
});
