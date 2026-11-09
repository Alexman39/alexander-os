import {
  Home,
  Sun,
  Briefcase,
  GraduationCap,
  HeartPulse,
  LibraryBig,
  Radar,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "home"
  | "life"
  | "work"
  | "university"
  | "health"
  | "library"
  | "intelligence"
  | "assistant"
  | "settings";

export interface NavModule {
  id: ModuleId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** CSS colour used to tint the ambient background and module chrome. */
  accent: string;
  /** Aurora palette (a, b, c) for the ambient layer. */
  aurora: [string, string, string];
  /** Whether the module is designed in this prototype. */
  designed: boolean;
  /** Shown in the mobile dock (max 4 + "More"). */
  dock?: boolean;
  blurb: string;
}

/** Order follows docs/PRODUCT.md → Navigation. */
export const NAV: NavModule[] = [
  {
    id: "home",
    dock: true,
    label: "Home",
    href: "/",
    icon: Home,
    accent: "var(--color-lime)",
    aurora: ["#173a8c", "#3c2a9e", "#0d6a6e"],
    designed: true,
    blurb: "Briefing, today, focus and progress",
  },
  {
    id: "life",
    dock: true,
    label: "Life",
    href: "/life",
    icon: Sun,
    accent: "var(--color-personal)",
    aurora: ["#5a3510", "#3b1f6b", "#123a5c"],
    designed: false,
    blurb: "Personal routines, errands and finance",
  },
  {
    id: "work",
    dock: true,
    label: "Work",
    href: "/work",
    icon: Briefcase,
    accent: "var(--color-system)",
    aurora: ["#0f3f7a", "#162a66", "#0b5466"],
    designed: false,
    blurb: "Projects, tasks and notes",
  },
  {
    id: "university",
    label: "University",
    href: "/university",
    icon: GraduationCap,
    accent: "var(--color-system)",
    aurora: ["#14306e", "#2b1d6e", "#0b4f5e"],
    designed: false,
    blurb: "Courses, deadlines and thesis",
  },
  {
    id: "health",
    label: "Health",
    href: "/health",
    icon: HeartPulse,
    accent: "var(--color-positive)",
    aurora: ["#0b5a52", "#123b6e", "#2a2a6e"],
    designed: false,
    blurb: "Workouts and nutrition (sensitive data)",
  },
  {
    id: "library",
    label: "Library",
    href: "/library",
    icon: LibraryBig,
    accent: "var(--color-personal)",
    aurora: ["#6b3a0c", "#40205e", "#0f3a5a"],
    designed: true,
    blurb: "Books, games and films",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    href: "/intelligence",
    icon: Radar,
    accent: "var(--color-intel)",
    aurora: ["#3a1e8a", "#5b2bb5", "#13306e"],
    designed: true,
    blurb: "Monitored topics and briefings",
  },
  {
    id: "assistant",
    dock: true,
    label: "Assistant",
    href: "/assistant",
    icon: Sparkles,
    accent: "var(--color-system)",
    aurora: ["#0c3f80", "#2b2690", "#0b5a6e"],
    designed: true,
    blurb: "Grounded answers and approved actions",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
    accent: "var(--color-ink-muted)",
    aurora: ["#1a2547", "#262a55", "#11324a"],
    designed: true,
    blurb: "Motion, ambience and demo mode",
  },
];

export function moduleForPath(pathname: string): NavModule {
  if (pathname === "/") return NAV[0];
  const seg = pathname.split("/")[1];
  return NAV.find((m) => m.id === seg) ?? NAV[0];
}

export function moduleIndex(id: ModuleId): number {
  return NAV.findIndex((m) => m.id === id);
}
