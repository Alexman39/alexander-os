import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { test as setup } from "@playwright/test";
import { makeSignature } from "better-auth/crypto";
import pg from "pg";
import {
  E2E_EMAIL_DOMAIN,
  E2E_OWNER_GITHUB_ID,
  INTRUDER_STATE,
  OWNER_SIGNOUT_STATE,
  OWNER_STATE,
} from "./auth-constants";

/**
 * Creates two signed-in test identities directly in the database:
 *  - an "owner" whose GitHub account ID equals the test server's OWNER_GITHUB_ID
 *  - an "intruder" with a different GitHub account (must be refused)
 * Cookies are signed exactly as Better Auth signs them, so the server's real
 * session checks run unchanged. Uses fake IDs/emails, never the real owner.
 */
loadEnvConfig(process.cwd());

async function createIdentity(client: pg.Client, label: string, githubId: string) {
  const user = await client.query<{ id: string }>(
    `insert into "user"(name, email, "emailVerified", "updatedAt") values ($1, $2, true, now()) returning id`,
    [`E2E ${label}`, `${label}@${E2E_EMAIL_DOMAIN}`],
  );
  const userId = user.rows[0].id;
  await client.query(
    `insert into account("accountId", "providerId", "userId", "updatedAt") values ($1, 'github', $2, now())`,
    [githubId, userId],
  );
  return { userId, token: await createSession(client, userId) };
}

async function createSession(client: pg.Client, userId: string) {
  const token = randomBytes(32).toString("base64url");
  await client.query(
    `insert into session(token, "userId", "expiresAt", "updatedAt") values ($1, $2, now() + interval '1 day', now())`,
    [token, userId],
  );
  return token;
}

async function writeState(path: string, token: string, secret: string) {
  const value = `${token}.${await makeSignature(token, secret)}`;
  const state = {
    cookies: [
      {
        name: "better-auth.session_token",
        value,
        domain: "localhost",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 86_400,
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };
  writeFileSync(path, JSON.stringify(state));
}

setup("create signed-in test identities", async () => {
  const url = process.env.DATABASE_URL;
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!url || !secret) throw new Error("E2E tests need DATABASE_URL and BETTER_AUTH_SECRET (see .env.example).");
  if (process.env.VERCEL_ENV === "production") throw new Error("Refusing to create test users in production.");

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`delete from "user" where email like $1`, [`%@${E2E_EMAIL_DOMAIN}`]);
    const owner = await createIdentity(client, "owner", E2E_OWNER_GITHUB_ID);
    const signOutToken = await createSession(client, owner.userId);
    const intruder = await createIdentity(client, "intruder", "999999999");
    mkdirSync("tests/.auth", { recursive: true });
    await writeState(OWNER_STATE, owner.token, secret);
    await writeState(OWNER_SIGNOUT_STATE, signOutToken, secret);
    await writeState(INTRUDER_STATE, intruder.token, secret);
  } finally {
    await client.end();
  }
});
