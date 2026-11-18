import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import { getDb } from "./db";
import { getServerEnv } from "./env";
import { OWNER_ONLY_ERROR } from "./owner";

export interface Owner {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

type OwnerResult = { status: "owner"; owner: Owner } | { status: "signed-out" } | { status: "not-owner" };

/**
 * Data Access Layer entry point: resolves the request's session and re-checks
 * that it belongs to the owner. Deduplicated per request with React cache().
 * Reads request headers, so callers must render inside <Suspense>.
 */
export const getOwnerSession = cache(async (): Promise<OwnerResult> => {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) return { status: "signed-out" };

  const db = getDb();
  const ownerAccount = await db.account.findFirst({
    where: { userId: session.user.id, providerId: "github", accountId: getServerEnv().OWNER_GITHUB_ID },
    select: { id: true },
  });
  if (!ownerAccount) {
    // A session for anyone else should be impossible; if one exists, revoke it.
    await db.session.deleteMany({ where: { userId: session.user.id } });
    return { status: "not-owner" };
  }

  const { id, name, email, image } = session.user;
  return { status: "owner", owner: { id, name, email, image: image ?? null } };
});

/** Use in every protected Server Component, Server Action and Route Handler. */
export async function requireOwner(): Promise<Owner> {
  const result = await getOwnerSession();
  if (result.status === "owner") return result.owner;
  redirect(result.status === "not-owner" ? `/sign-in?error=${OWNER_ONLY_ERROR}` : "/sign-in");
}
