import { isFinalStatus, PAYMENT_POLLING, type SalePaymentStatus } from "../domain/payment-status";
import type { CheckPaymentStatusUseCase } from "./check-payment-status.use-case";

/**
 * Time, as the polling needs it. A port so the tests can move the clock
 * without waiting seconds; the browser gets the real one from di/.
 */
export interface PollingClock {
  now(): number;
  /** Resolves after `ms`, or as soon as `signal` aborts. */
  wait(ms: number, signal?: AbortSignal): Promise<void>;
}

export interface PollingPolicy {
  readonly intervalMs: number;
  readonly maxDurationMs: number;
}

export type PollOutcome =
  /** The payment reached a final status: paid, declined or cancelled. */
  | { readonly kind: "settled"; readonly status: SalePaymentStatus }
  /** Still pending after the whole minute: the user decides when to ask again. */
  | { readonly kind: "timeout" }
  /** Whoever asked stopped listening (the screen was left). */
  | { readonly kind: "aborted" };

/**
 * The polling of a payment: asks how it is going every `intervalMs` while it
 * is pending, for at most `maxDurationMs`. The next check starts only after
 * the previous one answered, so they never overlap. Any error of a check
 * (502, 409, 404) stops the polling and is rejected as it is.
 */
export class PollPaymentStatusUseCase {
  constructor(
    private readonly check: CheckPaymentStatusUseCase,
    private readonly clock: PollingClock,
    private readonly policy: PollingPolicy = PAYMENT_POLLING,
  ) {}

  async execute(saleId: string, signal?: AbortSignal): Promise<PollOutcome> {
    const startedAt = this.clock.now();

    for (;;) {
      const { status } = await this.check.execute(saleId);
      if (isAborted(signal)) return { kind: "aborted" };
      if (isFinalStatus(status)) return { kind: "settled", status };

      // One more check would end after the minute: stop here.
      if (this.clock.now() - startedAt + this.policy.intervalMs > this.policy.maxDurationMs) {
        return { kind: "timeout" };
      }

      await this.clock.wait(this.policy.intervalMs, signal);
      if (isAborted(signal)) return { kind: "aborted" };
    }
  }
}

/** A function, so TypeScript reads the flag again after each await. */
function isAborted(signal: AbortSignal | undefined): boolean {
  return signal?.aborted === true;
}
