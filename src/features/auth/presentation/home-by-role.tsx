"use client";

import type { ReactNode } from "react";

import { useAuth } from "./use-auth";

interface HomeByRoleProps {
  readonly admin: ReactNode;
  readonly seller: ReactNode;
}

/**
 * Picks the home page of the role: the dashboard of reports for whoever may
 * read them, the sales of the day otherwise. The route passes both screens,
 * each from its own feature, so auth decides which one without importing
 * reports or sales, and only the chosen one is mounted (and fetches).
 */
export function HomeByRole({ admin, seller }: HomeByRoleProps) {
  const { state } = useAuth();
  if (state.status !== "authenticated") return null;

  return <>{state.user.can("reports:read") ? admin : seller}</>;
}
