import type { Metadata } from "next";
import { IntelligenceView } from "@/components/intelligence/IntelligenceView";

export const metadata: Metadata = { title: "Intelligence" };

export default function IntelligencePage() {
  return <IntelligenceView />;
}
