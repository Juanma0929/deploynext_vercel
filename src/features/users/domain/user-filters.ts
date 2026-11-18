import { filter } from "@/shared/domain/collections";
import type { Role } from "@/shared/domain/role";

import type { User } from "./user";

export type UserStatus = "active" | "inactive";

/** The search of the list. Empty fields are not applied. */
export interface UserFilters {
  /** Matched against the name and the email, ignoring case and accents. */
  readonly term: string;
  readonly role: Role | null;
  readonly status: UserStatus | null;
}

export const EMPTY_USER_FILTERS: UserFilters = { term: "", role: null, status: null };

export function filterUsers(users: readonly User[], filters: UserFilters): User[] {
  const term = normalize(filters.term);
  const { role, status } = filters;

  return filter(users, [
    term === "" ? null : (user) => normalize(`${user.name} ${user.email}`).includes(term),
    role === null ? null : (user) => user.role === role,
    status === null ? null : (user) => user.isActive === (status === "active"),
  ]);
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}
