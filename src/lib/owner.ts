/**
 * Single-owner rule. Alexander OS is a private, single-user system: only the
 * GitHub account whose numeric ID is OWNER_GITHUB_ID may ever sign in.
 * Pure so it can be unit tested; enforced in three places:
 *   1. Better Auth account-create hook (before any account row is written)
 *   2. Better Auth session-create hook (no session for anyone else)
 *   3. getOwner() on every protected request (re-checks the stored account)
 */

export const OWNER_ONLY_ERROR = "NOT_OWNER";

export interface AccountIdentity {
  providerId: string;
  accountId: string | number;
}

export function isOwnerAccount(account: AccountIdentity, ownerGithubId: string): boolean {
  if (!/^\d+$/.test(ownerGithubId)) return false; // misconfiguration never grants access
  return account.providerId === "github" && String(account.accountId) === ownerGithubId;
}

/** Only allow same-site relative paths as post-sign-in destinations. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next.startsWith("/sign-in") || next.startsWith("/api/")) return "/";
  return next;
}
