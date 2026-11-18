"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { formErrorsFrom } from "@/shared/presentation/form-errors";
import { onSessionReset } from "@/shared/presentation/session-reset";

import { usersContainer } from "../di/container";
import { EmailAlreadyRegisteredError } from "../domain/errors";
import type { User } from "../domain/user";
import type { NewUser, UserChanges } from "../domain/user-input";

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

/** The store of users: the list, loaded once, and the changes that keep it up to date. */
export function UsersProvider({ currentUserId, children }: UsersProviderProps) {
  const [list, setList] = useState<UsersListState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    usersContainer()
      .listUsers.execute()
      .then((users) => {
        if (isCurrent) setList({ status: "ready", users });
      })
      .catch((error: unknown) => {
        if (isCurrent) setList({ status: "error", message: errorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  // Nothing of the users of the business survives a logout.
  useEffect(() => onSessionReset(() => setList({ status: "loading" })), []);

  const reload = useCallback(() => {
    setList({ status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  /** Puts the saved user in the list, replacing it if it was already there. */
  const upsert = useCallback((saved: User) => {
    setList((current) => {
      if (current.status !== "ready") return current;
      const others = current.users.filter((user) => user.id !== saved.id);
      const users = [...others, saved].sort((a, b) => a.name.localeCompare(b.name, "es"));
      return { status: "ready", users };
    });
  }, []);

  const run = useCallback(
    async (action: () => Promise<User>): Promise<UserActionResult> => {
      try {
        upsert(await action());
        return { ok: true };
      } catch (error: unknown) {
        if (error instanceof EmailAlreadyRegisteredError) {
          return { ok: false, message: null, fieldErrors: { email: error.message } };
        }
        const { fields, message } = formErrorsFrom(error, USER_FIELDS);
        return { ok: false, message, fieldErrors: fields };
      }
    },
    [upsert],
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
