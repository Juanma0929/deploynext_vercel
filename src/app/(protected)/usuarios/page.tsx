import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios",
};

/** Admin only (users:manage); the app shell shows the access denied page to anyone else. */
export default function UsersPage() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="text-muted text-sm">Crea cuentas, cambia roles y desactiva usuarios.</p>
    </section>
  );
}
