import type { CardDetails, CardIssues } from "../domain/card-details";
import type { CardToken, CardTokenizer } from "../domain/card-tokenizer";
import { CardRejectedError, TokenizerUnavailableError } from "../domain/errors";
import type {
  WompiCardTokenRequestDto,
  WompiCardTokenResponseDto,
  WompiErrorBodyDto,
} from "./dto/wompi.dto";

const SANDBOX_URL = "https://sandbox.wompi.co/v1";
const PRODUCTION_URL = "https://production.wompi.co/v1";

/** Which field of the form each field of Wompi is. */
const WOMPI_FIELDS: Readonly<Record<string, keyof CardIssues>> = {
  number: "cardNumber",
  exp_month: "expMonth",
  exp_year: "expYear",
  cvc: "cvc",
  card_holder: "cardHolder",
};

/**
 * JUSTIFIED EXCEPTION to "a single HTTP client".
 *
 * The shared HttpClient talks to our API and attaches the JWT of the user.
 * This one talks to Wompi, another server, and must never send that JWT: it
 * authenticates with the PUBLIC key of the merchant, the only key the
 * frontend has (the private ones live in the backend).
 *
 * It exists so the card goes straight from the browser to Wompi: the number
 * and the CVC never pass through our backend, which only receives the token.
 * It is the only place outside src/shared/infrastructure/http that calls
 * fetch, and only payments/di creates it.
 */
export class WompiCardTokenizer implements CardTokenizer {
  /**
   * The key is read on the first tokenisation, not when the container is
   * built, so a missing NEXT_PUBLIC_WOMPI_PUBLIC_KEY only breaks the card
   * form and not the Nequi one.
   */
  constructor(private readonly publicKey: () => string) {}

  async tokenize(card: CardDetails): Promise<CardToken> {
    const key = this.publicKey();
    const body: WompiCardTokenRequestDto = {
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc,
      card_holder: card.holder,
    };

    let response: Response;
    try {
      response = await fetch(`${baseUrlFor(key)}/tokens/cards`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch {
      throw new TokenizerUnavailableError();
    }

    // 422 is Wompi refusing the data of the card; a 4xx otherwise (a wrong
    // public key, for example) is not something the user can fix either way.
    if (response.status >= 400 && response.status < 500) {
      throw new CardRejectedError(await this.readIssues(response));
    }
    if (!response.ok) throw new TokenizerUnavailableError();

    const { data } = (await response.json()) as WompiCardTokenResponseDto;
    return { id: data.id, brand: data.brand, lastFour: data.last_four };
  }

  /** Wompi reports errors as { error: { messages: { number: [..], cvc: [..] } } }. */
  private async readIssues(response: Response): Promise<CardIssues> {
    try {
      const { error } = (await response.json()) as WompiErrorBodyDto;
      const issues: { -readonly [K in keyof CardIssues]: CardIssues[K] } = {};
      for (const wompiField of Object.keys(error?.messages ?? {})) {
        const field = WOMPI_FIELDS[wompiField];
        if (field !== undefined) issues[field] = "Wompi no aceptó este dato.";
      }
      return issues;
    } catch {
      return {};
    }
  }
}

/** A production key goes to production; anything else (pub_test_…) to the sandbox. */
function baseUrlFor(publicKey: string): string {
  return publicKey.startsWith("pub_prod_") ? PRODUCTION_URL : SANDBOX_URL;
}
