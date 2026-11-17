import type { Metadata } from "next";

import { getServerSession } from "@/features/auth/di/server";
import { ROLE_LABELS } from "@/shared/presentation/role-labels";

export const metadata: Metadata = {
  title: "Inicio",
};

export default async function DashboardPage() {
  // The layout already guaranteed there is a session; this reads it again to
  // greet the user. Next.js deduplicates the request within the same render.
  const user = await getServerSession();

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Hola, {user?.name}</h1>
      <p className="text-muted text-sm">
        Entraste como {user === null ? "" : ROLE_LABELS[user.role].toLowerCase()}. Usa el menú
        para ir a una sección.
      </p>
    </section>
  );
}
