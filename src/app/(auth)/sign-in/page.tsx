import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInCard } from "@/components/auth/SignInCard";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <Suspense>
      <SignInCard />
    </Suspense>
  );
}
