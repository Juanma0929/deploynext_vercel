"use client";

import { useChargeWithCard } from "./use-charge-with-card";
import { useChargeWithNequi } from "./use-charge-with-nequi";

export { usePaymentStatus } from "./use-payment-status";

/**
 * The facade of payments of a sale: how to charge it with Nequi or a card.
 * Its status is followed with usePaymentStatus, exported from here and backed
 * by the payments store.
 */
export function usePayment(saleId: string) {
  const chargeWithNequi = useChargeWithNequi(saleId);
  const chargeWithCard = useChargeWithCard(saleId);
  return { chargeWithNequi, chargeWithCard };
}
