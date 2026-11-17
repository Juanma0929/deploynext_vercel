"use client";

import { useEffect, type ReactNode } from "react";

import { Button } from "./button";

interface ModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  /** The actions of the dialog, rendered at the bottom. */
  readonly footer?: ReactNode;
}

/**
 * A dialog for creating or confirming without leaving the list behind.
 *
 * Escape closes it and the body stops scrolling while it is open, which is what
 * the user expects from a dialog and what keeps the page underneath from
 * moving.
 */
export function Modal({ isOpen, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // The click must not reach the backdrop, or typing inside would close
        // the dialog.
        onClick={(event) => event.stopPropagation()}
        className="bg-surface border-border max-h-full w-full max-w-lg overflow-y-auto rounded-t-lg border p-5 sm:rounded-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
            ✕
          </Button>
        </div>

        {children}

        {footer !== undefined && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
