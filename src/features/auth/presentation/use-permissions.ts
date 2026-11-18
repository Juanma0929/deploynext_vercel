"use client";

import { useCallback } from "react";

import type { Permission } from "../domain/permissions";
import { useAuth } from "./use-auth";

export interface PermissionsState {
  /** False while the session loads or when there is no session. */
  readonly can: (permission: Permission) => boolean;
}

/** The facade of the permission matrix for components. */
export function usePermissions(): PermissionsState {
  const { state } = useAuth();
  const user = state.status === "authenticated" ? state.user : null;

  const check = useCallback(
    (permission: Permission) => user !== null && user.can(permission),
    [user],
  );

  return { can: check };
}
