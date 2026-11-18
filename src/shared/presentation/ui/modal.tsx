"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

/**
 * A modal on top of the native <dialog>: it traps the focus, closes with
 * Escape and gives the focus back to the element that opened it. Never
 * window.confirm(): every confirmation of the app is one of these.
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** The row of buttons at the bottom of a modal, aligned to the right. */
export function ModalActions({ children }: { readonly children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2">{children}</div>;
}
