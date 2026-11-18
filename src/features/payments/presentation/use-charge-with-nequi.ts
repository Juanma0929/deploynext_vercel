"use client";

import { useCallback } from "react";

import { ValidationError, errorMessage, isRetryable } from "@/shared/domain/errors";
import { formErrorsFrom } from "@/shared/presentation/form-errors";

import { paymentsContainer } from "../di/container";
import { SaleNotChargeableError } from "../domain/errors";
import {
  InvalidPaymentRequestError,
  type NequiPaymentField,
  type NequiPaymentValues,
  type PaymentIssues,
} from "../domain/payment-request";
import type { StartedPayment } from "../domain/payment.repository";

const NEQUI_FIELDS: readonly NequiPaymentField[] = ["customerEmail", "phoneNumber"];

export type ChargeResult =
  | { readonly kind: "started"; readonly payment: StartedPayment }
  /** The fields break a rule (ours, or the API's 400): show each message next to its field. */
  | { readonly kind: "invalid"; readonly issues: PaymentIssues; readonly message: string | null }
  /** 409: it was charged (or is being charged) already; retrying will not help. */
  | { readonly kind: "not-chargeable"; readonly message: string }
  /** 502, the network and anything else; canRetry when nothing was charged and it may work again. */
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
          return { kind: "invalid", issues: error.issues, message: null };
        }
        if (error instanceof ValidationError) {
          const { fields, message } = formErrorsFrom(error, NEQUI_FIELDS);
          return { kind: "invalid", issues: fields, message };
        }
        if (error instanceof SaleNotChargeableError) {
          return { kind: "not-chargeable", message: error.message };
        }
        return { kind: "failed", message: errorMessage(error), canRetry: isRetryable(error) };
      }
    },
    [saleId],
  );
}
