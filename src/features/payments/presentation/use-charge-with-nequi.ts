"use client";

import { useCallback } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { paymentsContainer } from "../di/container";
import { PaymentGatewayError, SaleNotChargeableError } from "../domain/errors";
import {
  InvalidPaymentRequestError,
  type NequiPaymentValues,
  type PaymentIssues,
} from "../domain/payment-request";
import type { StartedPayment } from "../domain/payment.repository";

export type ChargeResult =
  | { readonly kind: "started"; readonly payment: StartedPayment }
  /** The fields break a rule: show each message next to its field. */
  | { readonly kind: "invalid"; readonly issues: PaymentIssues }
  /** 409: it was charged (or is being charged) already; retrying will not help. */
  | { readonly kind: "not-chargeable"; readonly message: string }
  /** 502 and anything else: nothing was charged, so it can be tried again. */
  | { readonly kind: "failed"; readonly message: string; readonly canRetry: boolean };

/** The facade of the Nequi form. */
export function useChargeWithNequi(saleId: string) {
  return useCallback(
    async (values: NequiPaymentValues): Promise<ChargeResult> => {
      try {
        const payment = await paymentsContainer().chargeWithNequi.execute(saleId, values);
        return { kind: "started", payment };
      } catch (error: unknown) {
        if (error instanceof InvalidPaymentRequestError) {
          return { kind: "invalid", issues: error.issues };
        }
        if (error instanceof SaleNotChargeableError) {
          return { kind: "not-chargeable", message: error.message };
        }
        return {
          kind: "failed",
          message: errorMessage(error),
          canRetry: error instanceof PaymentGatewayError,
        };
      }
    },
    [saleId],
  );
}
