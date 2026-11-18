"use client";

import type { ReactNode } from "react";

import type { Permission } from "../domain/permissions";
import { usePermissions } from "./use-permissions";

interface CanProps {
  readonly permission: Permission;
  readonly children: ReactNode;
  /** What to render instead. Nothing by default: the action simply is not there. */
  readonly fallback?: ReactNode;
}

/**
 * Shows its children only to the roles that have the permission:
 *
 *   <Can permission="sales:cancel"><CancelSaleButton /></Can>
 *
 * Hiding is not authorising: the API checks the role on every request.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  return usePermissions().can(permission) ? <>{children}</> : <>{fallback}</>;
}
