import type { CardDetails } from "./card-details";

/** What Wompi gives back for a card: the token to charge it, and how to show it. */
export interface CardToken {
  readonly id: string;
  /** "VISA", "MASTERCARD"… */
  readonly brand: string;
  readonly lastFour: string;
}

/**
 * Turns a card into a token, straight from the browser to the payment gateway,
 * so the number and the CVC never reach our backend. Rejects with
 * CardRejectedError when the gateway refuses the card data, or with
 * TokenizerUnavailableError when it cannot be reached.
 */
export interface CardTokenizer {
  tokenize(card: CardDetails): Promise<CardToken>;
}
