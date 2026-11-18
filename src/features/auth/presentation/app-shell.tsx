"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AccessDenied } from "./access-denied";
import { navigationFor, ROLE_LABELS } from "./navigation";
import { useAuth } from "./use-auth";
import { useForbiddenNotice } from "./use-forbidden-notice";

/**
 * The frame of every protected page: the navigation of the role, then the page.
 *
 * It is also the guard by role. The role is not in the token (the API reads it
 * from the database on every request), so the proxy cannot check it: it is
 * checked here, with the profile, against the routes of the permission matrix.
 * A route the role cannot open renders the access denied page instead of the
 * page, so it is blocked even when typed in the address bar.
 */
export function AppShell({ children }: { readonly children: ReactNode }) {
  const { state, logout } = useAuth();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const forbidden = useForbiddenNotice();

  function handleLogout() {
    setIsLoggingOut(true);
    void logout();
  }

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
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Cierra tu sesión en todos tus dispositivos"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-60"
          >
            {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {forbidden.isVisible && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
          >
            <p className="flex-1">
              No tienes permiso para hacer esa acción. Si tu rol cambió hace poco, cierra sesión y
              vuelve a entrar.
            </p>
            <button
              type="button"
              onClick={forbidden.dismiss}
              className="font-medium underline underline-offset-2"
            >
              Cerrar
            </button>
          </div>
        )}
        {user.canAccessRoute(pathname) ? children : <AccessDenied />}
      </div>
    </div>
  );
}
