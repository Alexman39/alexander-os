import { Suspense } from "react";
import { Shell } from "@/components/shell/Shell";
import { requireOwner } from "@/lib/session";

/**
 * Everything in (os) is owner-only. The proxy already redirects requests
 * without a session cookie; this re-checks the session itself on every
 * request. It sits in a Suspense boundary (Cache Components requirement) so
 * the static shell still streams instantly.
 */
export default function OsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      {children}
      <Suspense fallback={null}>
        <OwnerGuard />
      </Suspense>
    </Shell>
  );
}

async function OwnerGuard() {
  await requireOwner();
  return null;
}
