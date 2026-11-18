"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Modal surface built on native <dialog>: gives focus containment,
 * Escape-to-close, inert background and focus restoration for free.
 * `side` controls placement: a right "blade", a bottom sheet, or centred.
 */
export function Sheet({
  open,
  onClose,
  title,
  side = "center",
  children,
  className,
  hideTitle,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "center" | "right" | "bottom" | "top";
  children: ReactNode;
  className?: string;
  hideTitle?: boolean;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // React's autoFocus runs before the dialog opens; focus the intended field afterwards.
      d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const placement = {
    center: "m-auto w-[min(92vw,560px)] rounded-(--radius-panel) animate-rise",
    top: "mx-auto mt-[12vh] mb-auto w-[min(92vw,620px)] rounded-(--radius-panel) animate-rise",
    right:
      "ml-auto mr-0 my-0 h-dvh max-h-dvh w-[min(100vw,480px)] rounded-none rounded-l-(--radius-panel) animate-enter-right",
    bottom: "mx-auto mb-0 mt-auto w-full max-w-xl rounded-t-[16px] rounded-b-none animate-rise",
  }[side];

  return (
    <dialog
      ref={ref}
      aria-label={labelledBy ? undefined : title}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // backdrop click
      }}
      className={cn(
        "max-w-none overflow-hidden p-0 text-ink surface-3 backdrop:bg-void/70 backdrop:backdrop-blur-sm",
        placement,
        className,
      )}
    >
      {open && (
        <div className="flex h-full max-h-[inherit] flex-col">
          {!hideTitle && (
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
              <h2 className="text-display text-base font-semibold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-white/[0.08] hover:text-ink"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
