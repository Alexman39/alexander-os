#!/usr/bin/env node
/**
 * Runs `prisma migrate deploy` during Vercel *production* builds only.
 *
 * Policy (docs/ARCHITECTURE.md → Migrations): a migration reaches production
 * only after it is reviewed, committed to main and has passed CI. Preview and
 * local builds never migrate, because previews currently share the production
 * database. A failed migration fails the build, so code that needs the new
 * schema is never deployed without it.
 */
import { spawnSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

if (env !== "production") {
  console.log(`[migrate] VERCEL_ENV=${env ?? "unset"} → skipping migrations (production builds only).`);
  process.exit(0);
}

if (!process.env.DATABASE_URL_UNPOOLED && !process.env.DATABASE_URL) {
  console.error("[migrate] No DATABASE_URL_UNPOOLED or DATABASE_URL in the production environment.");
  process.exit(1);
}

console.log("[migrate] Production build → applying pending migrations…");
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
if (result.status !== 0) {
  console.error("[migrate] Migration failed; aborting the build so the old deployment stays live.");
  process.exit(result.status ?? 1);
}
console.log("[migrate] Done.");
