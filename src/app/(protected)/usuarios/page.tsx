import type { Metadata } from "next";

import { CurrentUsersScreen } from "./current-users-screen";

export const metadata: Metadata = {
  title: "Usuarios",
};

/** Admin only (users:manage); the app shell shows the access denied page to anyone else. */
export default function UsersPage() {
  return <CurrentUsersScreen />;
}
