import { expect, test } from "@playwright/test";
import { EnvError, parseServerEnv } from "../../src/lib/env-schema";

const valid = {
  DATABASE_URL: "postgresql://user:pw@ep-x-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  BETTER_AUTH_SECRET: "x".repeat(44),
  BETTER_AUTH_URL: "http://localhost:3000",
  GITHUB_CLIENT_ID: "Ov23li0000000000000a",
  GITHUB_CLIENT_SECRET: "f".repeat(40),
  OWNER_GITHUB_ID: "89802016",
};

test.describe("server env", () => {
  test("accepts a complete environment and defaults optional values", () => {
    const env = parseServerEnv(valid);
    expect(env.OWNER_GITHUB_ID).toBe("89802016");
    expect(env.DEMO_MODE).toBe(false);
    expect(env.CRON_SECRET).toBeUndefined();
  });

  test("names every missing key without leaking values", () => {
    try {
      parseServerEnv({ ...valid, DATABASE_URL: undefined, GITHUB_CLIENT_SECRET: "" });
      throw new Error("expected EnvError");
    } catch (e) {
      expect(e).toBeInstanceOf(EnvError);
      const msg = (e as EnvError).message;
      expect(msg).toContain("DATABASE_URL: missing");
      expect(msg).toContain("GITHUB_CLIENT_SECRET: missing");
      expect(msg).not.toContain(valid.BETTER_AUTH_SECRET);
    }
  });

  test("rejects malformed values", () => {
    expect(() => parseServerEnv({ ...valid, BETTER_AUTH_URL: "https://alexander-os-eta.vercel.app/" })).toThrow(
      /BETTER_AUTH_URL: must not end with a slash/,
    );
    expect(() => parseServerEnv({ ...valid, OWNER_GITHUB_ID: "Alexman39" })).toThrow(/numeric GitHub account ID/);
    expect(() => parseServerEnv({ ...valid, BETTER_AUTH_SECRET: "short" })).toThrow(/at least 32/);
    expect(() => parseServerEnv({ ...valid, DATABASE_URL: "mysql://x" })).toThrow(/postgres/);
  });

  test("DEMO_MODE parses common truthy spellings", () => {
    expect(parseServerEnv({ ...valid, DEMO_MODE: "true" }).DEMO_MODE).toBe(true);
    expect(parseServerEnv({ ...valid, DEMO_MODE: "1" }).DEMO_MODE).toBe(true);
    expect(parseServerEnv({ ...valid, DEMO_MODE: "false" }).DEMO_MODE).toBe(false);
  });
});
