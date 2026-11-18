import { z } from "zod";

/**
 * Server environment contract. Pure (no `server-only`) so it can be unit
 * tested; app code reads values through `getServerEnv()` in `env.ts`.
 * Error messages name keys only — never values.
 */

const booleanString = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((v) => v === "true" || v === "1");

const httpUrl = z.url({ protocol: /^https?$/ }).refine((u) => !u.endsWith("/"), "must not end with a slash");

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database (Neon). Pooled for the app, direct (unpooled) for migrations.
  DATABASE_URL: z.string().startsWith("postgres", "must be a postgres:// connection string"),
  DATABASE_URL_UNPOOLED: z.string().startsWith("postgres").optional(),

  // Authentication (Better Auth + GitHub, owner-only).
  BETTER_AUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
  BETTER_AUTH_URL: httpUrl,
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  OWNER_GITHUB_ID: z.string().regex(/^\d+$/, "must be the numeric GitHub account ID"),

  // Optional until the features that use them land.
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(32, "must be at least 32 characters").optional(),

  // Show labelled sample data instead of the owner's records. Off unless set.
  DEMO_MODE: booleanString,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(
      `Invalid server environment:\n${problems.map((p) => `  - ${p}`).join("\n")}\nSee .env.example and docs/SETUP.md.`,
    );
    this.name = "EnvError";
    this.problems = problems;
  }
}

/** Parse an env-like record. Empty strings count as unset. */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== ""));
  const result = serverEnvSchema.safeParse(cleaned);
  if (!result.success) {
    throw new EnvError(
      result.error.issues.map(
        (i) => `${i.path.join(".") || "(root)"}: ${i.code === "invalid_type" ? "missing" : i.message}`,
      ),
    );
  }
  return result.data;
}
