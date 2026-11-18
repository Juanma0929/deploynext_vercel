import { isUuid } from "@/shared/domain/uuid";

import {
  CardDetails,
  cardPaymentIssues,
  InvalidCardPaymentError,
  type CardPaymentFormValues,
} from "../domain/card-details";
import type { CardToken, CardTokenizer } from "../domain/card-tokenizer";
import { PaymentSaleNotFoundError } from "../domain/errors";
import { PaymentRequest } from "../domain/payment-request";
import type { PaymentRepository, StartedPayment } from "../domain/payment.repository";

export interface StartedCardPayment {
  readonly payment: StartedPayment;
  /** How to show the card that was charged: brand and last four digits. */
  readonly card: Pick<CardToken, "brand" | "lastFour">;
}

/**
 * Charges a sale with a card, in two steps:
 * 1. the card goes straight from the browser to Wompi, which gives a token;
 * 2. only that token goes to our API (POST /sales/:id/payment).
 *
 * The card never reaches our backend and is not kept anywhere: it lives in
 * this call and is gone when it returns. Every rule is checked before either
 * request, so a typo costs no round trip.
 */
export class ChargeWithCardUseCase {
  constructor(
    private readonly tokenizer: CardTokenizer,
    private readonly repository: PaymentRepository,
  ) {}

  async execute(saleId: string, values: CardPaymentFormValues, now: Date): Promise<StartedCardPayment> {
    if (!isUuid(saleId)) throw new PaymentSaleNotFoundError();

    const issues = cardPaymentIssues(values, now);
    if (Object.keys(issues).length > 0) throw new InvalidCardPaymentError(issues);

    const token = await this.tokenizer.tokenize(CardDetails.from(values, now));

    const request = PaymentRequest.card({
      customerEmail: values.customerEmail,
      cardToken: token.id,
      installments: Number(values.installments),
    });
    const payment = await this.repository.charge(saleId, request);

    return { payment, card: { brand: token.brand, lastFour: token.lastFour } };
  }
}
