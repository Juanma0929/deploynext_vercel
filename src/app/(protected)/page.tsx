import type { Metadata } from "next";

import { WelcomeMessage } from "@/features/auth/presentation";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <main className="flex flex-col gap-2">
      <WelcomeMessage />
      <p className="text-muted">Inventario y ventas para pequeños negocios.</p>
    </main>
  );
}
