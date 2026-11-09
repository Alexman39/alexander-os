"use client";

import { useSyncExternalStore } from "react";

/**
 * Client-only external stores read through useSyncExternalStore so the server
 * render and first client render agree (server snapshot), then update.
 */

/** Current time, quantised to `stepMs` so snapshots stay stable between ticks. */
export function useNow(stepMs = 20_000): number | null {
  return useSyncExternalStore(
    (cb) => {
      const t = window.setInterval(cb, Math.min(stepMs, 10_000));
      return () => window.clearInterval(t);
    },
    () => Math.floor(Date.now() / stepMs) * stepMs,
    () => null,
  );
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

const PREF_EVENT = "aos:pref";

/** A string preference persisted in localStorage (falls back to memory). */
const memory = new Map<string, string>();

export function readPref(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export function writePref(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked — memory copy still works for this tab */
  }
  window.dispatchEvent(new Event(PREF_EVENT));
}

export function usePref<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const raw = useSyncExternalStore(
    (cb) => {
      window.addEventListener(PREF_EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(PREF_EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => readPref(key),
    () => null,
  );
  return raw && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}
