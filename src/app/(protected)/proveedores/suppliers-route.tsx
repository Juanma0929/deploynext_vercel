"use client";

import { usePermissions } from "@/features/auth/presentation";
import { SuppliersScreen } from "@/features/suppliers/presentation";

interface SuppliersRouteProps {
  /** The supplier just deleted, from ?eliminado=, to confirm it. */
  readonly deletedName: string | undefined;
}

/**
 * Asks the permission matrix of auth whether the role may change suppliers,
 * so suppliers does not import auth. A seller gets the list read-only.
 */
export function SuppliersRoute({ deletedName }: SuppliersRouteProps) {
  const { can } = usePermissions();
  return <SuppliersScreen canManage={can("suppliers:write")} deletedName={deletedName} />;
}
