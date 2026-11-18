"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";

import { paymentsContainer } from "../di/container";
import { NoPaymentToCheckError, PaymentGatewayError } from "../domain/errors";
import { isFinalStatus, PAYMENT_POLLING, type SalePaymentStatus } from "../domain/payment-status";

export type PaymentStatusState =
  /** Asking every few seconds while the payment is pending. */
  | { readonly phase: "checking" }
  | { readonly phase: "paid" }
  /** Declined: the API gave the stock back; a new sale is needed to try again. */
  | { readonly phase: "declined" }
  | { readonly phase: "cancelled" }
  /** Still pending after the whole minute: the user decides when to ask again. */
  | { readonly phase: "timeout" }
  /** 502: Wompi did not answer; the sale did not change. */
  | { readonly phase: "gateway-error"; readonly message: string }
  /** 409: there is no payment to check. */
  | { readonly phase: "no-payment"; readonly message: string }
  | { readonly phase: "error"; readonly message: string };

export interface PaymentStatusOptions {
  /** Called once, when the payment reaches a final status. */
  readonly onSettled?: (status: SalePaymentStatus) => void;
}

/**
 * The polling of a payment: GET /sales/:id/payment/status every 2.5 seconds
 * while the sale is pending, for at most a minute. It stops as soon as the
 * status is final, on any error, after the minute, and when the component
 * unmounts (the pending timer is cleared and a late answer is ignored).
 * retry() starts a new minute.
 *
 * A sale that is already final when the hook mounts is shown as it is,
 * without asking: the API would answer the same.
 */
export function usePaymentStatus(
  saleId: string,
  initialStatus: SalePaymentStatus,
  options: PaymentStatusOptions = {},
) {
  const [state, setState] = useState<PaymentStatusState>(() => stateOf(initialStatus));
  // Each round is one minute of polling; 0 means "do not poll".
  const [round, setRound] = useState(isFinalStatus(initialStatus) ? 0 : 1);

  // The latest callback, without restarting the polling when it changes.
  const onSettled = useRef(options.onSettled);
  useEffect(() => {
    onSettled.current = options.onSettled;
  });

  useEffect(() => {
    if (round === 0) return;

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    const { checkPaymentStatus } = paymentsContainer();

    async function check() {
      try {
        const { status } = await checkPaymentStatus.execute(saleId);
        if (!isActive) return;

        if (isFinalStatus(status)) {
          setState(stateOf(status));
          onSettled.current?.(status);
          return;
        }
        // One more check would end after the minute: stop and let the user decide.
        if (Date.now() - startedAt + PAYMENT_POLLING.intervalMs > PAYMENT_POLLING.maxDurationMs) {
          setState({ phase: "timeout" });
          return;
        }
        // The next check is scheduled only after this one answered, so they never overlap.
        timer = setTimeout(() => void check(), PAYMENT_POLLING.intervalMs);
      } catch (error: unknown) {
        if (!isActive) return;
        setState(
          error instanceof PaymentGatewayError
            ? { phase: "gateway-error", message: error.message }
            : error instanceof NoPaymentToCheckError
              ? { phase: "no-payment", message: error.message }
              : { phase: "error", message: errorMessage(error) },
        );
      }
    }

    void check();

    return () => {
      isActive = false;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [round, saleId]);

  const retry = useCallback(() => {
    setState({ phase: "checking" });
    setRound((value) => value + 1);
  }, []);

  return { state, retry };
}

function stateOf(status: SalePaymentStatus): PaymentStatusState {
  switch (status) {
    case "pending":
      return { phase: "checking" };
    case "paid":
      return { phase: "paid" };
    case "declined":
      return { phase: "declined" };
    case "cancelled":
      return { phase: "cancelled" };
  }
}
