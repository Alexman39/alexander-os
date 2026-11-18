import { loadEnvConfig } from "@next/env";
import { test as teardown } from "@playwright/test";
import pg from "pg";
import { E2E_EMAIL_DOMAIN } from "./auth-constants";

loadEnvConfig(process.cwd());

teardown("remove test identities", async () => {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    // Cascades to their accounts, sessions and any records the tests created.
    await client.query(`delete from "user" where email like $1`, [`%@${E2E_EMAIL_DOMAIN}`]);
  } finally {
    await client.end();
  }
});
