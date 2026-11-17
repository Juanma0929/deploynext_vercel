import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "@/features/auth/di/server";
import type { Role } from "@/features/auth/domain";
import { AuthProvider, LogoutButton, ROLE_LABELS } from "@/features/auth/presentation";

/**
 * Nothing in the protected area can be prerendered: every page depends on the
 * session cookie of the request, so the whole segment renders per request.
 */
export const instant = false;

interface NavItem {
  readonly href: string;
  readonly label: string;
  /** Undefined means every logged-in user sees it. */
  readonly roles?: readonly Role[];
}

const NAV: readonly NavItem[] = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/products", label: "Productos" },
  { href: "/suppliers", label: "Proveedores" },
  { href: "/sales", label: "Ventas" },
  { href: "/reports", label: "Reportes", roles: ["admin"] },
  { href: "/users", label: "Usuarios", roles: ["admin"] },
];

/**
 * The layout of the protected area, and its guard.
 *
 * It is a Server Component, so the session is resolved before anything reaches
 * the browser: a visitor without a session is redirected and never receives the
 * page. The navigation is built from the role for the same reason, which is why
 * a seller is not even sent the links to the admin sections.
 *
 * Hiding a link is not authorisation. The API checks the role on every request;
 * this only keeps the interface honest about what the user can do.
 */
export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  const user = await getServerSession();

  if (user === null) {
    redirect("/login");
  }

  const items = NAV.filter((item) => item.roles === undefined || user.hasAnyRole(item.roles));

  return (
    <AuthProvider initialUser={user.toSnapshot()}>
      <div className="flex min-h-full flex-col">
        <header className="border-border bg-surface border-b">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <Link href="/dashboard" className="text-base font-semibold">
              StockPyme
            </Link>

            <nav aria-label="Secciones" className="order-3 w-full sm:order-2 sm:w-auto">
              <ul className="text-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="order-2 ml-auto flex items-center gap-3 sm:order-3">
              <span className="text-muted hidden text-sm sm:inline">
                {user.name} · {ROLE_LABELS[user.role]}
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </div>
    </AuthProvider>
  );
}
