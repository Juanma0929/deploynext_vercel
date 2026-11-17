import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getServerSession } from "@/features/auth/di/server";
import { listUsersOnServer } from "@/features/users/di/server";
import { UsersAdmin } from "@/features/users/presentation";

export const metadata: Metadata = {
  title: "Usuarios",
};

/**
 * Administering users is admin-only. The check runs on the server, before the
 * screen is sent, so a seller who types the address receives the not-found page
 * and never the interface.
 *
 * The list is read here too, so the screen arrives with its data, and the
 * identifier of the administrator is handed down because the screen needs it to
 * stop them from demoting or deactivating themselves.
 */
export default async function UsersPage() {
  const user = await getServerSession();

  if (user === null || !user.isAdmin()) {
    notFound();
  }

  const users = await listUsersOnServer();

  return (
    <UsersAdmin
      currentUserId={user.id}
      initialUsers={users.map((item) => item.toSnapshot())}
    />
  );
}
