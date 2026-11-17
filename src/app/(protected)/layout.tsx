import type { ReactNode } from "react";

import { AppShell } from "@/features/auth/presentation";

/** Every route in this group is protected by src/proxy.ts. */
export default function PrivateLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
