"use client";

import { createStore } from "@/shared/presentation/store";

import type { SalePaymentStatus } from "../domain/payment-status";

/**
 * The store of payments: the last status known of each sale being charged
 * in this session, so that going back to a sale that was already settled
 * does not show it as pending again. Logging out empties it.
 */
export const paymentStatuses = createStore<Readonly<Record<string, SalePaymentStatus>>>({});

export function rememberPaymentStatus(saleId: string, status: SalePaymentStatus): void {
  paymentStatuses.set((current) => (current[saleId] === status ? current : { ...current, [saleId]: status }));
}
