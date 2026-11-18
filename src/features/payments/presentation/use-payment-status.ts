"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { notifyDataChanged } from "@/shared/presentation/data-changes";

import { paymentsContainer } from "../di/container";
import { NoPaymentToCheckError, PaymentGatewayError } from "../domain/errors";
import { isFinalStatus, type SalePaymentStatus } from "../domain/payment-status";
import { paymentStatuses, rememberPaymentStatus } from "./payments-store";

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
 * The polling of a payment, run by PollPaymentStatusUseCase: GET
 * /sales/:id/payment/status every 2.5 seconds while the sale is pending, for
 * at most a minute. It stops as soon as the status is final, on any error,
 * after the minute, and when the component unmounts (the pending wait is
 * cleared and a late answer is ignored).
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
  // A status settled earlier in this session wins over the one the page was rendered with.
  const [startStatus] = useState(() => {
    const known = paymentStatuses.get()[saleId];
    return known !== undefined && isFinalStatus(known) ? known : initialStatus;
  });
  const [state, setState] = useState<PaymentStatusState>(() => stateOf(startStatus));
  // Each round is one minute of polling; 0 means "do not poll".
  const [round, setRound] = useState(isFinalStatus(startStatus) ? 0 : 1);

  // The latest callback, without restarting the polling when it changes.
  const onSettled = useRef(options.onSettled);
  useEffect(() => {
    onSettled.current = options.onSettled;
  });

  useEffect(() => {
    if (round === 0) return;

    // Leaving the screen aborts: the pending wait is cleared and a late answer is ignored.
    const controller = new AbortController();

    paymentsContainer()
      .pollPaymentStatus.execute(saleId, controller.signal)
      .then((outcome) => {
        if (outcome.kind === "aborted" || controller.signal.aborted) return;
        if (outcome.kind === "timeout") {
          setState({ phase: "timeout" });
          return;
        }
        setState(stateOf(outcome.status));
        rememberPaymentStatus(saleId, outcome.status);
        // Approved or declined: the sale changed, and a declined one gave its stock back.
        notifyDataChanged("sales", "products");
        onSettled.current?.(outcome.status);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState(
          error instanceof PaymentGatewayError
            ? { phase: "gateway-error", message: error.message }
            : error instanceof NoPaymentToCheckError
              ? { phase: "no-payment", message: error.message }
              : { phase: "error", message: errorMessage(error) },
        );
      });

    return () => controller.abort();
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
