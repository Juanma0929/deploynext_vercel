"use client";

import { createContext, useCallback, useMemo, type ReactNode } from "react";

import { formErrorsFrom } from "@/shared/presentation/form-errors";
import { loadStateOf, useResource } from "@/shared/presentation/store";

import { usersContainer } from "../di/container";
import { EmailAlreadyRegisteredError } from "../domain/errors";
import type { User } from "../domain/user";
import type { NewUser, UserChanges } from "../domain/user-input";
import { upsertUser, usersResource } from "./users-store";

export type UsersListState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly users: readonly User[] }
  | { readonly status: "error"; readonly message: string };

/** The fields of the user form, named as the API names them. */
export const USER_FIELDS = ["name", "email", "password", "role"] as const;
export type UserField = (typeof USER_FIELDS)[number];

/**
 * The result of a change. `fieldErrors` go next to their inputs (an email
 * already taken, a 400 of the API); `message`, when there is one, goes above.
 */
export type UserActionResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly message: string | null;
      readonly fieldErrors: Partial<Record<UserField, string>>;
    };

export interface UsersContextValue {
  /** The logged-in admin, for the rule that it cannot lock itself out. */
  readonly currentUserId: string;
  readonly list: UsersListState;
  readonly reload: () => void;
  readonly create: (user: NewUser) => Promise<UserActionResult>;
  readonly update: (target: User, changes: UserChanges) => Promise<UserActionResult>;
  readonly deactivate: (target: User) => Promise<UserActionResult>;
  readonly reactivate: (target: User) => Promise<UserActionResult>;
}

export const UsersContext = createContext<UsersContextValue | null>(null);

interface UsersProviderProps {
  readonly currentUserId: string;
  readonly children: ReactNode;
}

/**
 * Gives the screen of users who is logged in; the list itself lives in the
 * users store (users-store.ts), loaded once and emptied on logout.
 */
export function UsersProvider({ currentUserId, children }: UsersProviderProps) {
  const state = loadStateOf(useResource(usersResource, "cached"));
  const list = useMemo<UsersListState>(
    () => (state.status === "ready" ? { status: "ready", users: state.data } : state),
    [state],
  );

  const reload = useCallback(() => void usersResource.reload(), []);

  const run = useCallback(
    async (action: () => Promise<User>): Promise<UserActionResult> => {
      try {
        upsertUser(await action());
        return { ok: true };
      } catch (error: unknown) {
        if (error instanceof EmailAlreadyRegisteredError) {
          return { ok: false, message: null, fieldErrors: { email: error.message } };
        }
        const { fields, message } = formErrorsFrom(error, USER_FIELDS);
        return { ok: false, message, fieldErrors: fields };
      }
    },
    [],
  );

  const value = useMemo<UsersContextValue>(() => {
    const { createUser, updateUser, deactivateUser, reactivateUser } = usersContainer();
    return {
      currentUserId,
      list,
      reload,
      create: (user) => run(() => createUser.execute(user)),
      update: (target, changes) => run(() => updateUser.execute(currentUserId, target, changes)),
      deactivate: (target) => run(() => deactivateUser.execute(currentUserId, target)),
      reactivate: (target) => run(() => reactivateUser.execute(target)),
    };
  }, [currentUserId, list, reload, run]);

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
