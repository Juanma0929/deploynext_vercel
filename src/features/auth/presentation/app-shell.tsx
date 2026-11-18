"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { ROLE_LABELS } from "@/shared/domain/role";
import { Button, Spinner, ToastProvider, cn, useToast } from "@/shared/presentation/ui";

import { onForbiddenResponse } from "../di/container";
import type { User } from "../domain/user";
import { AccessDenied } from "./access-denied";
import { activeNavigationHref, navigationFor, type NavigationItem } from "./navigation";
import { useAuth } from "./use-auth";

/**
 * The frame of every protected page: a sidebar on desktop and a drawer on
 * mobile, both with the menu of the role, and the page.
 *
 * It is also the guard by role. The role is not in the token (the API reads it
 * from the database on every request), so the proxy cannot check it: it is
 * checked here, with the profile, against the routes of the permission matrix.
 * A route the role cannot open renders the access denied page instead of the
 * page, so it is blocked even when typed in the address bar.
 */
export function AppShell({ children }: { readonly children: ReactNode }) {
  const { state } = useAuth();
  const pathname = usePathname();

  if (state.status !== "authenticated") {
    return (
      <div role="status" aria-live="polite" className="flex min-h-full items-center justify-center">
        <Spinner />
        <span className="sr-only">Cargando tu sesión…</span>
      </div>
    );
  }

  const { user } = state;
  const items = navigationFor(user.role);
  const activeHref = activeNavigationHref(items, pathname);

  return (
    <ToastProvider>
      <ForbiddenToasts />
      <a
        href="#contenido"
        className="focus:bg-primary sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido
      </a>

      <div className="min-h-full">
        {/* Desktop: the menu is always there, on the left. */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
          <Sidebar user={user} items={items} activeHref={activeHref} />
        </aside>

        <div className="flex min-h-full flex-col lg:pl-64">
          <MobileHeader user={user} items={items} activeHref={activeHref} />
          <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none">
            {user.canAccessRoute(pathname) ? children : <AccessDenied />}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

interface MenuProps {
  readonly user: User;
  readonly items: readonly NavigationItem[];
  readonly activeHref: string | null;
}

/** Mobile: a bar with the name of the app and a button that opens the menu as a drawer. */
function MobileHeader({ user, items, activeHref }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = useId();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const drawer = ref.current;
    if (drawer === null) return;
    // showModal() traps the focus in the drawer and makes Escape close it.
    if (isOpen && !drawer.open) drawer.showModal();
    if (!isOpen && drawer.open) drawer.close();
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <Link href="/" className="font-semibold">
        StockPyme
      </Link>
      <Button
        variant="secondary"
        size="sm"
        aria-expanded={isOpen}
        aria-controls={drawerId}
        onClick={() => setIsOpen(true)}
      >
        <span aria-hidden="true" className="text-base leading-none">
          ☰
        </span>
        Menú
      </Button>

      <dialog
        id={drawerId}
        ref={ref}
        aria-label="Menú principal"
        onClose={() => setIsOpen(false)}
        // A click on the backdrop (the dialog itself, outside the panel) closes it.
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}
        className="m-0 h-full max-h-none w-72 max-w-[85vw] bg-white p-0 shadow-xl backdrop:bg-slate-900/40"
      >
        <div className="flex h-full flex-col">
          <div className="flex justify-end px-3 pt-3">
            <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
              Cerrar menú
            </Button>
          </div>
          <Sidebar user={user} items={items} activeHref={activeHref} onNavigate={() => setIsOpen(false)} />
        </div>
      </dialog>
    </header>
  );
}

/** The menu of the role and, at the bottom, who is logged in and the logout. */
function Sidebar({
  user,
  items,
  activeHref,
  onNavigate = () => {},
}: MenuProps & { readonly onNavigate?: () => void }) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Link href="/" onClick={onNavigate} className="px-5 py-4 text-lg font-semibold">
        StockPyme
      </Link>

      <nav aria-label="Principal" className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm",
                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4">
        <p className="text-sm" data-testid="current-user">
          <span className="block font-medium">{user.name}</span>
          <span className="text-muted">{ROLE_LABELS[user.role]}</span>
        </p>
        <Button
          variant="secondary"
          size="sm"
          isLoading={isLoggingOut}
          loadingText="Cerrando sesión…"
          title="Cierra tu sesión en todos tus dispositivos"
          onClick={() => {
            setIsLoggingOut(true);
            void logout();
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

/** Every 403 of the API becomes a toast, wherever the request was made. */
function ForbiddenToasts() {
  const { toast } = useToast();

  useEffect(
    () =>
      onForbiddenResponse(() =>
        toast({
          tone: "danger",
          message:
            "No tienes permiso para hacer esa acción. Si tu rol cambió hace poco, cierra sesión y vuelve a entrar.",
        }),
      ),
    [toast],
  );

  return null;
}
