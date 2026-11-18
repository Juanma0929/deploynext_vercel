import { browserHttpClient } from "@/shared/di/http";
import { wompiPublicKey } from "@/shared/infrastructure/config/env";

import { ChargeWithCardUseCase } from "../application/charge-with-card.use-case";
import { ChargeWithNequiUseCase } from "../application/charge-with-nequi.use-case";
import { CheckPaymentStatusUseCase } from "../application/check-payment-status.use-case";
import { PollPaymentStatusUseCase } from "../application/poll-payment-status.use-case";
import { PaymentHttpRepository } from "../infrastructure/payment.http.repository";
import { WompiCardTokenizer } from "../infrastructure/wompi-card-tokenizer";
import { systemClock } from "./system-clock";

export interface PaymentsContainer {
  readonly chargeWithNequi: ChargeWithNequiUseCase;
  readonly chargeWithCard: ChargeWithCardUseCase;
  readonly checkPaymentStatus: CheckPaymentStatusUseCase;
  readonly pollPaymentStatus: PollPaymentStatusUseCase;
}

let container: PaymentsContainer | null = null;

/**
 * The use cases of payments for the browser, wired once. The only place the
 * Wompi tokenizer is created, with the public key.
 */
export function paymentsContainer(): PaymentsContainer {
  if (container !== null) return container;

  const repository = new PaymentHttpRepository(browserHttpClient());

  const checkPaymentStatus = new CheckPaymentStatusUseCase(repository);

  container = {
    chargeWithNequi: new ChargeWithNequiUseCase(repository),
    chargeWithCard: new ChargeWithCardUseCase(new WompiCardTokenizer(wompiPublicKey), repository),
    checkPaymentStatus,
    pollPaymentStatus: new PollPaymentStatusUseCase(checkPaymentStatus, systemClock),
  };
  return container;
}
