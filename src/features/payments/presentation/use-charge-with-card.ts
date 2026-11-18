"use client";

import { useCallback } from "react";

import { ValidationError, errorMessage, isRetryable } from "@/shared/domain/errors";
import { formErrorsFrom } from "@/shared/presentation/form-errors";

import type { StartedCardPayment } from "../application/charge-with-card.use-case";
import { paymentsContainer } from "../di/container";
import {
  InvalidCardPaymentError,
  type CardPaymentField,
  type CardPaymentFormValues,
  type CardPaymentIssues,
} from "../domain/card-details";
import { CardRejectedError, SaleNotChargeableError } from "../domain/errors";

/** The fields of the card form that POST /sales/:id/payment receives (the card goes to Wompi). */
const CARD_API_FIELDS: readonly CardPaymentField[] = ["customerEmail", "installments"];

export type CardChargeResult =
  | { readonly kind: "started"; readonly result: StartedCardPayment }
  /** The fields break a rule, or Wompi refused them: each message next to its field. */
  | { readonly kind: "invalid"; readonly issues: CardPaymentIssues; readonly message: string | null }
  /** 409: it was charged (or is being charged) already; retrying will not help. */
  | { readonly kind: "not-chargeable"; readonly message: string }
  /** Wompi or the API failed; nothing was charged, so it can be tried again when canRetry. */
  | { readonly kind: "failed"; readonly message: string; readonly canRetry: boolean };

/**
 * The facade of the card form. The values it receives are used for this call
 * only: nothing here keeps the card.
 */
export function useChargeWithCard(saleId: string) {
  return useCallback(
    async (values: CardPaymentFormValues): Promise<CardChargeResult> => {
      try {
        const result = await paymentsContainer().chargeWithCard.execute(saleId, values, new Date());
        return { kind: "started", result };
      } catch (error: unknown) {
        if (error instanceof InvalidCardPaymentError) {
          return { kind: "invalid", issues: error.issues, message: null };
        }
        if (error instanceof CardRejectedError) {
          return { kind: "invalid", issues: error.issues, message: error.message };
        }
        if (error instanceof ValidationError) {
          // A 400 of POST /sales/:id/payment: the email or the installments.
          const { fields, message } = formErrorsFrom(error, CARD_API_FIELDS);
          return { kind: "invalid", issues: fields, message };
        }
        if (error instanceof SaleNotChargeableError) {
          return { kind: "not-chargeable", message: error.message };
        }
        // PaymentGatewayError (502) and TokenizerUnavailableError are retryable: nothing was charged.
        return { kind: "failed", message: errorMessage(error), canRetry: isRetryable(error) };
      }
    },
    [saleId],
  );
}
