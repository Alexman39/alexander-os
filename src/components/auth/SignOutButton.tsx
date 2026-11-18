"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-white/[0.06] px-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:bg-white/[0.1] disabled:opacity-60"
    >
      {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <LogOut aria-hidden className="size-4" />}
      Sign out
    </button>
  );
}
