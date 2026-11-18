"use client";

import { useAuth } from "@/features/auth/presentation";
import { UsersScreen } from "@/features/users/presentation";

/**
 * Joins two features without one importing the other: auth knows who is
 * logged in, users needs it so an admin cannot lock itself out.
 */
export function CurrentUsersScreen() {
  const { state } = useAuth();
  if (state.status !== "authenticated") return null;

  return <UsersScreen currentUserId={state.user.id} />;
}
