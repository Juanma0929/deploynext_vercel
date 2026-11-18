import { browserHttpClient } from "@/shared/di/http";
import { wompiPublicKey } from "@/shared/infrastructure/config/env";

import { ChargeWithCardUseCase } from "../application/charge-with-card.use-case";
import { ChargeWithNequiUseCase } from "../application/charge-with-nequi.use-case";
import { PaymentHttpRepository } from "../infrastructure/payment.http.repository";
import { WompiCardTokenizer } from "../infrastructure/wompi-card-tokenizer";

export interface PaymentsContainer {
  readonly chargeWithNequi: ChargeWithNequiUseCase;
  readonly chargeWithCard: ChargeWithCardUseCase;
}

let container: PaymentsContainer | null = null;

/**
 * The use cases of payments for the browser, wired once. The only place the
 * Wompi tokenizer is created, with the public key.
 */
export function paymentsContainer(): PaymentsContainer {
  if (container !== null) return container;

  const repository = new PaymentHttpRepository(browserHttpClient());

  container = {
    chargeWithNequi: new ChargeWithNequiUseCase(repository),
    chargeWithCard: new ChargeWithCardUseCase(new WompiCardTokenizer(wompiPublicKey), repository),
  };
  return container;
}
