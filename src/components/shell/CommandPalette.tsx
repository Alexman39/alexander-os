"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type KeyboardEvent } from "react";
import { CornerDownLeft, Plus, Search, Wind } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useOs } from "./OsProvider";
import { Sheet } from "./Sheet";
import { Kbd } from "@/components/ui/primitives";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  run: () => void;
}

/** ⌘K / Ctrl+K — navigate and act without leaving the keyboard. */
export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setCaptureOpen, ambient, setAmbient } = useOs();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const close = () => {
    setPaletteOpen(false);
    setQ("");
    setSel(0);
  };

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "capture",
        label: "Quick capture",
        hint: "Action",
        icon: Plus,
        run: () => {
          close();
          setCaptureOpen(true);
        },
      },
      ...NAV.map((m) => ({
        id: m.id,
        label: `Go to ${m.label}`,
        hint: m.blurb,
        icon: m.icon,
        run: () => {
          close();
          router.push(m.href);
        },
      })),
      {
        id: "ambient",
        label: ambient ? "Pause ambient motion" : "Resume ambient motion",
        hint: "Preference",
        icon: Wind,
        run: () => {
          setAmbient(!ambient);
          close();
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ambient, router],
  );

  const filtered = commands.filter((c) => (c.label + " " + c.hint).toLowerCase().includes(q.trim().toLowerCase()));
  const active = Math.min(sel, Math.max(0, filtered.length - 1));

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => (s + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => (s - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  }

  return (
    <Sheet open={paletteOpen} onClose={close} title="Command palette" side="top" hideTitle>
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
        <Search aria-hidden className="size-4 text-ink-faint" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={filtered[active] ? `cmd-${filtered[active].id}` : undefined}
          aria-label="Search commands"
          placeholder="Jump to a module or run an action…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={onKeyDown}
          className="h-14 flex-1 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <Kbd>Esc</Kbd>
      </div>
      <ul id="palette-list" role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto p-2">
        {filtered.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-ink-muted">No matching commands.</li>
        )}
        {filtered.map((c, i) => {
          const Icon = c.icon;
          return (
            <li
              key={c.id}
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setSel(i)}
              onClick={c.run}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm",
                i === active ? "bg-lime/[0.12] text-ink shadow-[inset_2px_0_0_var(--color-lime)]" : "text-ink-muted",
              )}
            >
              <Icon aria-hidden className={cn("size-4", i === active ? "text-lime" : "text-ink-faint")} />
              <span className="font-medium">{c.label}</span>
              <span className="ml-auto truncate text-xs text-ink-faint">{c.hint}</span>
              {i === active && <CornerDownLeft aria-hidden className="size-3.5 text-lime" />}
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
