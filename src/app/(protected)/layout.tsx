import type { ReactNode } from "react";

import { AppShell } from "@/features/auth/presentation";

import { NameCatalogs } from "./name-catalogs";

/** Every route in this group is protected by src/proxy.ts. */
export default function PrivateLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShell>
      <NameCatalogs />
      {children}
    </AppShell>
  );
}
