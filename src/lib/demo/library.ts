/**
 * DEMO DATA — Personal Library.
 * Titles are real works used only as representative examples; all personal
 * fields (ownership, progress, ratings, notes) are fictional. Cover art is
 * generated procedurally — no third-party artwork is bundled.
 * Metadata provider: none connected (see docs/modules/library.md).
 */

export type MediaType = "BOOK" | "GAME" | "MOVIE";
export type Ownership = "owned" | "wishlist";
export type ProgressStatus = "backlog" | "in_progress" | "completed";
export type CoverPattern = "rings" | "bars" | "grid" | "sun" | "wave" | "split";

export interface LibraryEntry {
  id: string;
  type: MediaType;
  title: string;
  creator: string;
  year: number;
  ownership: Ownership;
  status: ProgressStatus;
  progress: number; // 0–100
  progressLabel: string;
  rating: number | null; // 0–5
  notes: string;
  tags: string[];
  meta: Array<[string, string]>;
  palette: [string, string, string]; // bg-from, bg-to, ink
  pattern: CoverPattern;
  updated: string;
}

export const DEMO_LIBRARY: LibraryEntry[] = [
  {
    id: "L-1", type: "BOOK", title: "Designing Data-Intensive Applications", creator: "Martin Kleppmann", year: 2017,
    ownership: "owned", status: "in_progress", progress: 62, progressLabel: "Ch. 9 of 12", rating: null,
    notes: "Re-read the replication chapter before the distributed systems exam.",
    tags: ["systems", "university"], meta: [["Pages", "616"], ["Format", "Paperback"]],
    palette: ["#0f3b5f", "#1b6d8f", "#e6f6ff"], pattern: "grid", updated: "2d ago",
  },
  {
    id: "L-2", type: "GAME", title: "Outer Wilds", creator: "Mobius Digital", year: 2019,
    ownership: "owned", status: "in_progress", progress: 35, progressLabel: "≈9 h played", rating: null,
    notes: "No spoilers. Currently exploring the twin planets.",
    tags: ["exploration"], meta: [["Platform", "PC"], ["Length", "≈22 h"]],
    palette: ["#2a1450", "#d2602a", "#fff1e0"], pattern: "sun", updated: "yesterday",
  },
  {
    id: "L-3", type: "MOVIE", title: "Arrival", creator: "Denis Villeneuve", year: 2016,
    ownership: "owned", status: "completed", progress: 100, progressLabel: "Watched", rating: 5,
    notes: "Linguistics framing is still the best part.",
    tags: ["sci-fi"], meta: [["Runtime", "116 min"], ["Format", "Digital"]],
    palette: ["#1d2530", "#6f7f8f", "#f2f2ee"], pattern: "rings", updated: "3w ago",
  },
  {
    id: "L-4", type: "BOOK", title: "Project Hail Mary", creator: "Andy Weir", year: 2021,
    ownership: "owned", status: "completed", progress: 100, progressLabel: "Finished", rating: 4,
    notes: "Great audiobook candidate for a re-listen.",
    tags: ["fiction", "sci-fi"], meta: [["Pages", "496"], ["Format", "E-book"]],
    palette: ["#3a1c08", "#e39a2d", "#fff6e5"], pattern: "rings", updated: "1mo ago",
  },
  {
    id: "L-5", type: "GAME", title: "Hades II", creator: "Supergiant Games", year: 2025,
    ownership: "wishlist", status: "backlog", progress: 0, progressLabel: "Not started", rating: null,
    notes: "Wait for the semester break.",
    tags: ["roguelike"], meta: [["Platform", "PC"], ["Price watch", "Off"]],
    palette: ["#21082e", "#7a2dbf", "#f7e8ff"], pattern: "bars", updated: "5d ago",
  },
  {
    id: "L-6", type: "BOOK", title: "Thinking, Fast and Slow", creator: "Daniel Kahneman", year: 2011,
    ownership: "owned", status: "backlog", progress: 0, progressLabel: "Not started", rating: null,
    notes: "",
    tags: ["psychology"], meta: [["Pages", "499"], ["Format", "Hardcover"]],
    palette: ["#f2efe6", "#c9c2ae", "#1b1b1b"], pattern: "split", updated: "2mo ago",
  },
  {
    id: "L-7", type: "MOVIE", title: "Spirited Away", creator: "Hayao Miyazaki", year: 2001,
    ownership: "wishlist", status: "backlog", progress: 0, progressLabel: "Not watched", rating: null,
    notes: "Find a cinema re-screening.",
    tags: ["animation"], meta: [["Runtime", "125 min"]],
    palette: ["#0b3a3a", "#e05a4b", "#fff3ec"], pattern: "wave", updated: "1w ago",
  },
  {
    id: "L-8", type: "GAME", title: "Disco Elysium", creator: "ZA/UM", year: 2019,
    ownership: "owned", status: "completed", progress: 100, progressLabel: "Completed", rating: 5,
    notes: "Writing-first RPG — revisit with a different build.",
    tags: ["rpg"], meta: [["Platform", "PC"], ["Length", "≈30 h"]],
    palette: ["#14222e", "#c4572a", "#f4e9d8"], pattern: "split", updated: "4mo ago",
  },
  {
    id: "L-9", type: "BOOK", title: "Meditations", creator: "Marcus Aurelius", year: 180,
    ownership: "owned", status: "in_progress", progress: 18, progressLabel: "Book II of XII", rating: null,
    notes: "Ten pages each morning.",
    tags: ["philosophy"], meta: [["Translation", "Hays"], ["Format", "Paperback"]],
    palette: ["#2c2416", "#8a6d3b", "#f6ecd6"], pattern: "wave", updated: "today",
  },
  {
    id: "L-10", type: "MOVIE", title: "Blade Runner 2049", creator: "Denis Villeneuve", year: 2017,
    ownership: "owned", status: "backlog", progress: 0, progressLabel: "Not watched", rating: null,
    notes: "",
    tags: ["sci-fi"], meta: [["Runtime", "164 min"], ["Format", "4K disc"]],
    palette: ["#2b0f0a", "#e87a2a", "#ffe9d4"], pattern: "bars", updated: "3w ago",
  },
  {
    id: "L-11", type: "GAME", title: "Baldur's Gate 3", creator: "Larian Studios", year: 2023,
    ownership: "owned", status: "backlog", progress: 0, progressLabel: "Not started", rating: null,
    notes: "Co-op run planned with friends.",
    tags: ["rpg", "co-op"], meta: [["Platform", "PC"], ["Length", "≈75 h"]],
    palette: ["#120d1f", "#7a1e2c", "#f3e2c8"], pattern: "grid", updated: "6d ago",
  },
  {
    id: "L-12", type: "BOOK", title: "The Pragmatic Programmer", creator: "Hunt & Thomas", year: 2019,
    ownership: "wishlist", status: "backlog", progress: 0, progressLabel: "Not started", rating: null,
    notes: "20th anniversary edition.",
    tags: ["software"], meta: [["Pages", "352"]],
    palette: ["#0a2a1c", "#3fa36b", "#eafff2"], pattern: "bars", updated: "2w ago",
  },
];

export const TYPE_LABEL: Record<MediaType, string> = { BOOK: "Book", GAME: "Game", MOVIE: "Film" };
export const STATUS_LABEL: Record<ProgressStatus, string> = {
  backlog: "Backlog",
  in_progress: "In progress",
  completed: "Completed",
};
