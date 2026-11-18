import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { getDb } from "./db";
import { getServerEnv } from "./env";
import { OWNER_ONLY_ERROR, isOwnerAccount } from "./owner";

function createAuth() {
  const env = getServerEnv();
  const db = getDb();

  return betterAuth({
    appName: "Alexander OS",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    // Transactions on, so a refused account rolls back the user row too.
    database: prismaAdapter(db, { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: false },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    account: {
      // security.md: provider tokens are encrypted at rest.
      encryptOAuthTokens: true,
    },
    advanced: {
      database: { generateId: "uuid" },
    },
    databaseHooks: {
      account: {
        create: {
          before: async (account) => {
            if (!isOwnerAccount(account, env.OWNER_GITHUB_ID)) {
              throw new APIError("FORBIDDEN", {
                code: OWNER_ONLY_ERROR,
                message: "This Alexander OS is private to its owner.",
              });
            }
          },
        },
      },
      session: {
        create: {
          // Defence in depth: never issue a session to a user without the owner's GitHub account.
          before: async (session) => {
            const owner = await db.account.findFirst({
              where: { userId: session.userId, providerId: "github", accountId: env.OWNER_GITHUB_ID },
              select: { id: true },
            });
            if (!owner) return false;
          },
        },
      },
    },
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as unknown as { auth?: Auth };

/** Lazily created so builds and pages without auth never need secrets. */
export function getAuth(): Auth {
  globalForAuth.auth ??= createAuth();
  return globalForAuth.auth;
}
