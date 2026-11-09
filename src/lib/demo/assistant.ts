/**
 * DEMO DATA — Assistant.
 * Scripted turns only. No language model is connected; nothing here is
 * generated at runtime and no tool actually executes.
 */

export type ToolAccess = "read" | "write";

export interface ToolDef {
  name: string;
  access: ToolAccess;
  description: string;
  /** write tools that leave the app (email etc.) are "external". */
  external?: boolean;
}

export const TOOL_REGISTRY: ToolDef[] = [
  { name: "list_tasks", access: "read", description: "Tasks and projects" },
  { name: "search_notes", access: "read", description: "Notes full-text" },
  { name: "get_calendar_events", access: "read", description: "Calendar (demo)" },
  { name: "list_library", access: "read", description: "Library entries" },
  { name: "search_intelligence", access: "read", description: "Events & sources" },
  { name: "get_briefing", access: "read", description: "Latest briefing" },
  { name: "create_task", access: "write", description: "Create a task" },
  { name: "update_task", access: "write", description: "Edit a task" },
  { name: "schedule_event", access: "write", description: "Add calendar event", external: true },
  { name: "send_email", access: "write", description: "Send an email", external: true },
];

export interface Citation {
  ref: string; // record id, e.g. T-12
  kind: "task" | "event" | "project" | "library" | "intel" | "note";
  label: string;
}

export interface ToolCall {
  tool: string;
  args: string;
  result: string;
}

export interface Proposal {
  id: string;
  tool: string;
  title: string;
  fields: Array<[string, string]>;
  external?: boolean;
}

export type Turn =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      /** Text may contain [[REF]] markers rendered as citation chips. */
      text: string;
      tools?: ToolCall[];
      citations?: Citation[];
      proposal?: Proposal;
    };

export interface Conversation {
  id: string;
  title: string;
  when: string;
  turns: Turn[];
}

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "C-1",
    title: "Plan tomorrow",
    when: "Now",
    turns: [
      { role: "user", text: "What should I focus on tomorrow?" },
      {
        role: "assistant",
        tools: [
          { tool: "list_tasks", args: "status=open, due≤tomorrow", result: "3 tasks" },
          { tool: "get_calendar_events", args: "date=tomorrow", result: "4 events (demo calendar)" },
        ],
        text:
          "Your calendar has a free block from 15:45 to 17:30 after thesis supervision [[E-4]]. The highest-priority open item is the literature review outline [[T-12]], which also unblocks the next action on your thesis project [[P-1]].\n\nI'd suggest using that block for the outline, and keeping the pull-request review [[T-18]] for the evening deep-work slot.",
        citations: [
          { ref: "E-4", kind: "event", label: "Thesis supervision · 15:00" },
          { ref: "T-12", kind: "task", label: "Finish literature review outline" },
          { ref: "P-1", kind: "project", label: "Thesis — retrieval evaluation" },
          { ref: "T-18", kind: "task", label: "Review PR for ingestion worker" },
        ],
        proposal: {
          id: "PR-1",
          tool: "create_task",
          title: "Create a focus block task",
          fields: [
            ["Title", "Lit review outline — focus block"],
            ["Project", "Thesis"],
            ["When", "Tomorrow 15:45–17:30"],
            ["Priority", "High"],
          ],
        },
      },
    ],
  },
  {
    id: "C-2",
    title: "Reading progress",
    when: "Yesterday",
    turns: [
      { role: "user", text: "What am I reading right now?" },
      {
        role: "assistant",
        tools: [{ tool: "list_library", args: "type=BOOK, status=in_progress", result: "2 entries" }],
        text:
          "Two books are in progress: Designing Data-Intensive Applications at 62% [[L-1]] and Meditations at 18% [[L-9]]. Your note on the first says to re-read the replication chapter before the exam.",
        citations: [
          { ref: "L-1", kind: "library", label: "Designing Data-Intensive Applications" },
          { ref: "L-9", kind: "library", label: "Meditations" },
        ],
      },
    ],
  },
  {
    id: "C-3",
    title: "Email supervisor",
    when: "Mon",
    turns: [
      { role: "user", text: "Draft an email to my supervisor moving our meeting to Thursday." },
      {
        role: "assistant",
        tools: [{ tool: "get_calendar_events", args: "query=supervision", result: "1 event" }],
        text:
          "I found your supervision meeting [[E-4]]. Here's a draft — sending email leaves Alexander OS, so it needs your explicit approval and nothing is sent until you confirm.",
        citations: [{ ref: "E-4", kind: "event", label: "Thesis supervision · 15:00" }],
        proposal: {
          id: "PR-3",
          tool: "send_email",
          external: true,
          title: "Send email",
          fields: [
            ["To", "supervisor@example.edu"],
            ["Subject", "Moving our meeting to Thursday"],
            ["Body", "Hi — would Thursday at the same time work instead? Thanks!"],
          ],
        },
      },
    ],
  },
];

/** Scripted follow-ups for suggested prompts. */
export const SCRIPTED_REPLIES: Record<string, Extract<Turn, { role: "assistant" }>> = {
  "Summarise today's intelligence": {
    role: "assistant",
    tools: [
      { tool: "get_briefing", args: "type=daily", result: "Demo briefing (no job has run)" },
      { tool: "search_intelligence", args: "tier=high", result: "2 events" },
    ],
    text:
      "Two high-relevance items today. An open-weight model family added long-context variants, though benchmarks are unreplicated [[EV-101]]. A tool-permission spec for agents reached public draft and closely mirrors your assistant's approval model [[EV-102]].",
    citations: [
      { ref: "EV-101", kind: "intel", label: "Long-context open-weight models · 4 sources" },
      { ref: "EV-102", kind: "intel", label: "Agent permission spec draft · 3 sources" },
    ],
  },
  "What's due this week?": {
    role: "assistant",
    tools: [{ tool: "list_tasks", args: "due≤sunday", result: "3 tasks" }],
    text:
      "Three items: the literature review outline today [[T-12]], the PR review today [[T-18]], and the physio booking, which is already done [[T-21]].",
    citations: [
      { ref: "T-12", kind: "task", label: "Finish literature review outline" },
      { ref: "T-18", kind: "task", label: "Review PR for ingestion worker" },
      { ref: "T-21", kind: "task", label: "Book physio follow-up · done" },
    ],
  },
};

export const SUGGESTED_PROMPTS = Object.keys(SCRIPTED_REPLIES);

export const FALLBACK_REPLY: Extract<Turn, { role: "assistant" }> = {
  role: "assistant",
  text:
    "Demo mode: no language model is connected, so I can only replay scripted examples. Try one of the suggested prompts below to see grounded answers with citations.",
};
