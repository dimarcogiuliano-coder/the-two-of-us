"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (it is still announced). */
  hideTitle?: boolean;
  children: ReactNode;
  size?: "sm" | "md";
};

/**
 * Accessible modal built on the native <dialog> element: focus is trapped,
 * Escape closes it and the background is inert.
 */
export function Dialog({ open, onClose, title, hideTitle, children, size = "sm" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop closes the dialog.
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-full p-4 open:flex open:items-center open:justify-center sm:p-6"
      style={{ maxWidth: size === "md" ? "34rem" : "26rem" }}
    >
      <div className="dialog-panel relative w-full rounded-[28px] bg-card p-6 shadow-2xl shadow-ink/20 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ink-soft transition hover:bg-ivory hover:text-ink"
        >
          <X className="size-5" aria-hidden />
        </button>
        <h2
          id={titleId}
          className={hideTitle ? "sr-only" : "pr-10 font-serif text-2xl leading-tight text-ink"}
        >
          {title}
        </h2>
        {open && children}
      </div>
    </dialog>
  );
}

type ConfirmProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{body}</p>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Keep it
        </button>
        <button type="button" onClick={onConfirm} className="btn-primary bg-burgundy hover:bg-burgundy-deep">
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
