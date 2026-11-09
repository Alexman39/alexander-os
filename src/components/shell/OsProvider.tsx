"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMediaQuery, usePref, writePref } from "@/lib/client-stores";

export type MotionPref = "system" | "reduced" | "full";
export type CaptureKind = "task" | "note" | "idea";

export interface CapturedItem {
  id: string;
  kind: CaptureKind;
  text: string;
  at: number;
}

interface Toast {
  id: number;
  text: string;
}

interface OsState {
  motion: MotionPref;
  setMotion: (m: MotionPref) => void;
  ambient: boolean;
  setAmbient: (on: boolean) => void;
  /** Resolved: true when motion should be minimised right now. */
  reducedMotion: boolean;

  captured: CapturedItem[];
  capture: (kind: CaptureKind, text: string) => void;

  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  captureOpen: boolean;
  setCaptureOpen: (open: boolean) => void;

  toasts: Toast[];
  toast: (text: string) => void;

  /** Optional tint override (e.g. Library focus colour). */
  tint: string | null;
  setTint: (c: string | null) => void;
}

const OsContext = createContext<OsState | null>(null);

const MOTION_PREFS = ["system", "reduced", "full"] as const;
const AMBIENT_PREFS = ["on", "off"] as const;

export function OsProvider({ children }: { children: ReactNode }) {
  const motion = usePref<MotionPref>("aos.motion", MOTION_PREFS, "system");
  const ambient = usePref("aos.ambient", AMBIENT_PREFS, "on") === "on";
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [captured, setCaptured] = useState<CapturedItem[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tint, setTint] = useState<string | null>(null);
  const toastId = useRef(0);

  // Reflect preferences onto <html> so global CSS can respond.
  useEffect(() => {
    const root = document.documentElement;
    if (motion === "system") root.removeAttribute("data-motion");
    else root.setAttribute("data-motion", motion);
  }, [motion]);

  useEffect(() => {
    document.documentElement.setAttribute("data-ambient", ambient ? "on" : "off");
  }, [ambient]);

  const setMotion = useCallback((m: MotionPref) => writePref("aos.motion", m), []);
  const setAmbient = useCallback((on: boolean) => writePref("aos.ambient", on ? "on" : "off"), []);

  const toast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const capture = useCallback(
    (kind: CaptureKind, text: string) => {
      const item: CapturedItem = { id: `Q-${Date.now().toString(36)}`, kind, text, at: Date.now() };
      setCaptured((c) => [item, ...c]);
      toast(`Captured ${kind} — demo session only, not saved`);
    },
    [toast],
  );

  const reducedMotion = motion === "reduced" || (motion === "system" && systemReduced);

  const value = useMemo<OsState>(
    () => ({
      motion,
      setMotion,
      ambient,
      setAmbient,
      reducedMotion,
      captured,
      capture,
      paletteOpen,
      setPaletteOpen,
      captureOpen,
      setCaptureOpen,
      toasts,
      toast,
      tint,
      setTint,
    }),
    [motion, setMotion, ambient, setAmbient, reducedMotion, captured, capture, paletteOpen, captureOpen, toasts, toast, tint],
  );

  return <OsContext.Provider value={value}>{children}</OsContext.Provider>;
}

export function useOs(): OsState {
  const ctx = useContext(OsContext);
  if (!ctx) throw new Error("useOs must be used inside <OsProvider>");
  return ctx;
}
