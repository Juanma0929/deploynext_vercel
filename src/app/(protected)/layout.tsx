import Link from "next/link";
import type { ReactNode } from "react";

import { HOME_PATH } from "@/shared/domain/session";

/**
 * The layout of the private area. Every route inside (protected) renders inside
 * it, and the proxy only lets a request get here with a token that has not
 * expired.
 *
 * The navigation by role, the user and the logout button belong to their own
 * stories (HU-05, HU-04 and HU-02) and are added to this header.
 */
export default function ProtectedLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3">
          <Link href={HOME_PATH} className="text-base font-semibold">
            StockPyme
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
