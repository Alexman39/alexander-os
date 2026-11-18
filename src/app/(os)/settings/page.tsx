import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsView } from "@/components/shell/SettingsView";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireOwner } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <SettingsView
      account={
        <Suspense fallback={<div className="skeleton h-12 w-64" aria-label="Loading account" />}>
          <AccountDetails />
        </Suspense>
      }
    />
  );
}

async function AccountDetails() {
  const owner = await requireOwner();
  return (
    <div className="flex flex-wrap items-center gap-4">
      {owner.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- GitHub avatar; no image optimisation needed
        <img src={owner.image} alt="" width={48} height={48} className="size-12 rounded-md" />
      ) : (
        <span aria-hidden className="grid size-12 place-items-center rounded-md bg-white/10 text-display text-lg">
          {owner.name.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{owner.name}</p>
        <p className="truncate text-xs text-ink-faint">{owner.email} · GitHub · owner</p>
      </div>
      <SignOutButton />
    </div>
  );
}
