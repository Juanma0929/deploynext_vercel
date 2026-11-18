"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useCatalogName, type NameCatalogKind } from "./name-catalogs";

interface CatalogNameProps {
  readonly catalog: NameCatalogKind;
  readonly id: string;
  /** What to show when the catalog has no such id (it was deleted). */
  readonly fallback: ReactNode;
  /** Shows the name as a link to this page. */
  readonly href?: string;
}

/**
 * The name of a product or a supplier by id, from the cached catalog of the
 * browser: the catalog is asked once per session, not once per screen. It can
 * be rendered from a Server Component (its props are plain data).
 */
export function CatalogName({ catalog, id, fallback, href }: CatalogNameProps) {
  const state = useCatalogName(catalog, id);

  if (state.status === "loading") {
    return (
      <span aria-busy="true" className="inline-block h-4 w-28 animate-pulse rounded bg-slate-200 align-middle">
        <span className="sr-only">Cargando…</span>
      </span>
    );
  }
  if (state.status === "missing") return <>{fallback}</>;
  if (href === undefined) return <>{state.name}</>;
  return (
    <Link href={href} className="text-primary hover:underline">
      {state.name}
    </Link>
  );
}
