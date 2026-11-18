"use client";

import { onDataChanged } from "@/shared/presentation/data-changes";
import { createResource } from "@/shared/presentation/store";

import { salesContainer } from "../di/container";

/**
 * The store of sales: the sales of the day and the history. They change all
 * the time (every sale, every payment), so the screens ask for them again each
 * time they open; the store keeps the last copy on screen while that happens
 * and shares one request between screens. Logging out empties it.
 */
export const todaySalesResource = createResource(() => salesContainer().listTodaySales.execute());
export const salesHistoryResource = createResource(() => salesContainer().listSalesHistory.execute());

onDataChanged("sales", () => {
  todaySalesResource.invalidate();
  salesHistoryResource.invalidate();
});
