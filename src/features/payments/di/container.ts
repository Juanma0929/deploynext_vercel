import { browserHttpClient } from "@/shared/di/http";

import { ChargeWithNequiUseCase } from "../application/charge-with-nequi.use-case";
import { PaymentHttpRepository } from "../infrastructure/payment.http.repository";

export interface PaymentsContainer {
  readonly chargeWithNequi: ChargeWithNequiUseCase;
}

let container: PaymentsContainer | null = null;

/** The use cases of payments for the browser, wired once. */
export function paymentsContainer(): PaymentsContainer {
  if (container !== null) return container;

  container = {
    chargeWithNequi: new ChargeWithNequiUseCase(new PaymentHttpRepository(browserHttpClient())),
  };
  return container;
}
