"use client";

import { createResource } from "@/shared/presentation/store";

import { usersContainer } from "../di/container";
import type { User } from "../domain/user";

/**
 * The store of users: the list of the business, loaded once and kept up to
 * date by the changes of the admin. Logging out empties it.
 */
export const usersResource = createResource(() => usersContainer().listUsers.execute());

/** Puts the saved user in the list, replacing it if it was already there. */
export function upsertUser(saved: User): void {
  usersResource.store.set((current) => {
    if (current.status !== "ready") return current;
    const others = current.data.filter((user) => user.id !== saved.id);
    const users = [...others, saved].sort((a, b) => a.name.localeCompare(b.name, "es"));
    return { status: "ready", data: users };
  });
}
