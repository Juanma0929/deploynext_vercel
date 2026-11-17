"use client";

import { useCallback, useState } from "react";

import { errorMessage } from "@/shared/domain/app-error";
import type { Role } from "@/shared/domain/role";

import { usersContainer } from "../di/container";
import { User, type NewUserInput, type UserSnapshot } from "../domain/user";

export interface UsersState {
  readonly users: readonly User[];
  readonly isWorking: boolean;
  /** The last failure, already written for the user, or null. */
  readonly error: string | null;
  readonly dismissError: () => void;
  readonly createUser: (input: NewUserInput) => Promise<boolean>;
  readonly changeRole: (id: string, role: Role) => Promise<void>;
  readonly setActive: (id: string, isActive: boolean) => Promise<void>;
}

/**
 * The facade the users screen talks to.
 *
 * The components never see the container, the repository or fetch: they read
 * this state and call these actions.
 *
 * The first list comes from the route, which already read it on the server, so
 * the screen arrives with its data. After every change the list is read again
 * from the API instead of being patched locally, so what is on screen is what
 * the server has.
 *
 * `actingUserId` is the administrator using the screen. It travels as a prop
 * from the route, which already resolved the session, instead of this feature
 * reaching into the auth feature.
 */
export function useUsers(actingUserId: string, initial: readonly UserSnapshot[]): UsersState {
  const [users, setUsers] = useState<readonly User[]>(() => initial.map(User.fromSnapshot));
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      setIsWorking(true);
      setError(null);
      try {
        await action();
        setUsers(await usersContainer().listUsers.execute());
        return true;
      } catch (cause) {
        setError(errorMessage(cause));
        return false;
      } finally {
        setIsWorking(false);
      }
    },
    [],
  );

  return {
    users,
    isWorking,
    error,
    dismissError: () => setError(null),
    createUser: (input) => run(() => usersContainer().createUser.execute(input)),
    changeRole: async (id, role) => {
      await run(() => usersContainer().changeUserRole.execute(id, role, actingUserId));
    },
    setActive: async (id, isActive) => {
      await run(() => usersContainer().setUserActive.execute(id, isActive, actingUserId));
    },
  };
}
