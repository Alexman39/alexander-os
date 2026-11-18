"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Loader2, LockKeyhole, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { OWNER_ONLY_ERROR, safeNextPath } from "@/lib/owner";
import { Monogram } from "@/components/shell/Wordmark";
import { Eyebrow } from "@/components/ui/primitives";

const ERRORS: Record<string, string> = {
  [OWNER_ONLY_ERROR]: "That GitHub account isn't the owner of this Alexander OS. Only the owner can sign in.",
  access_denied: "Sign-in was cancelled on GitHub. Nothing was changed.",
  state_mismatch: "The sign-in attempt expired or came from another tab. Please try again.",
};

export function SignInCard() {
  const params = useSearchParams();
  const [pending, setPending] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const errorCode = params.get("error");
  const message =
    clientError ?? (errorCode ? (ERRORS[errorCode] ?? "Sign-in didn't complete. Please try again.") : null);
  const next = safeNextPath(params.get("next"));

  async function signIn() {
    setPending(true);
    setClientError(null);
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: next,
      errorCallbackURL: "/sign-in",
    });
    if (error) {
      setClientError("Couldn't reach the sign-in service. Check your connection and try again.");
      setPending(false);
    }
    // On success the browser is redirected to GitHub, so pending stays true.
  }

  return (
    <section
      aria-labelledby="sign-in-title"
      className="relative overflow-hidden rounded-(--radius-panel) p-8 surface-3 chamfer"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-lime/20 blur-3xl"
      />
      <div className="relative flex flex-col items-start gap-6">
        <Monogram size={44} />
        <div>
          <Eyebrow tone="var(--color-lime)">Private system</Eyebrow>
          <h1 id="sign-in-title" className="mt-1 text-display text-4xl leading-none font-semibold">
            Alexander<span className="text-lime">OS</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Sign in with the owner&apos;s GitHub account. No other account can access this system.
          </p>
        </div>

        {message && (
          <p
            role="alert"
            className="flex w-full items-start gap-2 rounded-md bg-danger/10 px-3 py-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-danger)_40%,transparent)]"
          >
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={signIn}
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-lime text-base font-semibold text-void shadow-[0_0_24px_-6px_var(--color-lime)] transition-transform duration-(--duration-quick) hover:-translate-y-px disabled:translate-y-0 disabled:opacity-70"
        >
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-5 animate-spin" /> Opening GitHub…
            </>
          ) : (
            <>
              <LogIn aria-hidden className="size-5" /> Continue with GitHub
            </>
          )}
        </button>

        <p className="flex items-center gap-2 text-xs text-ink-faint">
          <LockKeyhole aria-hidden className="size-3.5" />
          Read-only GitHub profile access. No repositories, no write access.
        </p>
      </div>
    </section>
  );
}
