/**
 * DEMO DATA — Home.
 * Fictional, hand-written sample records for design review only.
 * Never rendered outside demo mode; replace with read models in Stage 1.
 */

export type Priority = "high" | "medium" | "low";

export interface DemoTask {
  id: string;
  title: string;
  project: string;
  priority: Priority;
  due: string;
  done: boolean;
}

export interface DemoScheduleItem {
  id: string;
  start: string; // HH:MM, Europe/Athens
  end: string;
  title: string;
  where?: string;
  kind: "university" | "work" | "life" | "health";
}

export interface DemoProject {
  id: string;
  name: string;
  area: "Work" | "University" | "Life";
  progress: number; // 0–100
  nextAction: string;
}

export interface DemoGoal {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  tone: "lime" | "personal" | "system" | "positive";
}

export const DEMO_FOCUS: DemoTask[] = [
  { id: "T-12", title: "Finish literature review outline", project: "Thesis", priority: "high", due: "Today", done: false },
  { id: "T-18", title: "Review pull request for ingestion worker", project: "Side project", priority: "medium", due: "Today", done: false },
  { id: "T-21", title: "Book physio follow-up", project: "Life admin", priority: "low", due: "Wed", done: true },
];

export const DEMO_SCHEDULE: DemoScheduleItem[] = [
  { id: "E-1", start: "08:30", end: "09:00", title: "Morning review", kind: "life" },
  { id: "E-2", start: "10:00", end: "11:30", title: "Distributed Systems lecture", where: "Room B204", kind: "university" },
  { id: "E-3", start: "13:00", end: "14:00", title: "Strength session", where: "Gym", kind: "health" },
  { id: "E-4", start: "15:00", end: "15:45", title: "Thesis supervision", where: "Video call", kind: "university" },
  { id: "E-5", start: "17:30", end: "19:00", title: "Deep work — ingestion worker", kind: "work" },
  { id: "E-6", start: "21:00", end: "22:00", title: "Reading block", kind: "life" },
];

export const DEMO_PROJECTS: DemoProject[] = [
  { id: "P-1", name: "Thesis — retrieval evaluation", area: "University", progress: 42, nextAction: "Outline chapter 2" },
  { id: "P-2", name: "Alexander OS", area: "Work", progress: 8, nextAction: "Approve visual prototype" },
  { id: "P-3", name: "Apartment move", area: "Life", progress: 65, nextAction: "Compare internet providers" },
];

export const DEMO_GOALS: DemoGoal[] = [
  { id: "G-1", label: "Deep work", value: 11, target: 15, unit: "h", tone: "lime" },
  { id: "G-2", label: "Reading", value: 140, target: 200, unit: "pp", tone: "personal" },
  { id: "G-3", label: "Training", value: 3, target: 4, unit: "sess", tone: "positive" },
];

export const DEMO_BRIEFING = {
  title: "Today's briefing",
  summary:
    "Two high-relevance developments in AI tooling, one business item worth a read, and a quieter day for your weekly topics.",
  highlights: [
    { id: "EV-101", text: "Open-weight model family adds long-context variants; independent benchmarks pending", interest: "AI & LLMs", sources: 4 },
    { id: "EV-102", text: "Agent tool-permission spec reaches public draft", interest: "AI & LLMs", sources: 3 },
    { id: "EV-104", text: "Analysis: usage-based pricing shifts for developer tools", interest: "Business", sources: 2 },
  ],
} as const;
