"use client";

import { usePermissions } from "@/features/auth/presentation";
import { TodaySalesScreen } from "@/features/sales/presentation";

/** Asks the permission matrix of auth, so sales does not import auth. */
export function TodaySalesRoute() {
  const { can } = usePermissions();
  return <TodaySalesScreen seesEverySeller={can("sales:read-all")} />;
}
