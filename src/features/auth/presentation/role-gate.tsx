"use client";

import type { ReactNode } from "react";

import type { Role } from "@/shared/domain/role";
import { useAuth } from "./use-auth";

interface RoleGateProps {
  readonly roles: readonly Role[];
  readonly children: ReactNode;
  /** What to render instead. Nothing by default: the element simply is not there. */
  readonly fallback?: ReactNode;
}

/**
 * Hides a piece of the interface from the roles that cannot use it, so a seller
 * never sees a button that would answer 403.
 *
 * This is only about what is shown. The API is what actually authorises, and it
 * checks the role on every request.
 */
export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  return useAuth().hasAnyRole(roles) ? <>{children}</> : <>{fallback}</>;
}
