"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { navigationFor, ROLE_LABELS } from "./navigation";
import { useAuth } from "./use-auth";

/** The frame of every protected page: the navigation of the role, then the page. */
export function AppShell({ children }: { readonly children: ReactNode }) {
  const { state } = useAuth();
  const pathname = usePathname();

  if (state.status !== "authenticated") {
    return (
      <div role="status" aria-live="polite" className="flex min-h-full items-center justify-center">
        <span
          aria-hidden="true"
          className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent"
        />
        <span className="sr-only">Cargando tu sesión…</span>
      </div>
    );
  }

  const { user } = state;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/" className="font-semibold">
            StockPyme
          </Link>
          <nav aria-label="Principal" className="flex flex-1 flex-wrap gap-1">
            {navigationFor(user.role).map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="text-sm" data-testid="current-user">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted"> · {ROLE_LABELS[user.role]}</span>
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
