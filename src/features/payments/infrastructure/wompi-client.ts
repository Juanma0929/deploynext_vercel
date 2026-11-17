import { ApiRequestError, NETWORK_ERROR_STATUS } from "@/shared/infrastructure/http";

import type {
  WompiCardTokenRequestDto,
  WompiCardTokenResponseDto,
  WompiErrorBodyDto,
  WompiMerchantResponseDto,
  WompiNequiTokenRequestDto,
  WompiNequiTokenResponseDto,
} from "./dto/wompi.dto";

const SANDBOX_URL = "https://sandbox.wompi.co/v1";
const PRODUCTION_URL = "https://production.wompi.co/v1";

/**
 * JUSTIFIED EXCEPTION to "a single HTTP client".
 *
 * The shared HttpClient talks to our API and attaches the JWT of the user. This
 * client talks to Wompi, a different server, and must never send that JWT:
 * Wompi authenticates the browser with the PUBLIC key of the merchant.
 *
 * It exists because the card data has to be tokenised straight from the browser
 * to Wompi, so the number and the CVC never pass through our backend. The
 * backend only receives the resulting token. The private keys live only in the
 * backend.
 *
 * It is the only place outside src/shared/infrastructure/http that calls fetch,
 * and only payments/di creates it.
 */
export class WompiClient {
  private readonly baseUrl: string;

  constructor(private readonly publicKey: string) {
    this.baseUrl = publicKey.startsWith("pub_prod_") ? PRODUCTION_URL : SANDBOX_URL;
  }

  /** The acceptance token the customer has to accept before paying. */
  async getAcceptance(): Promise<WompiMerchantResponseDto> {
    return this.send<WompiMerchantResponseDto>("GET", `/merchants/${this.publicKey}`);
  }

  async tokenizeCard(card: WompiCardTokenRequestDto): Promise<WompiCardTokenResponseDto> {
    return this.send<WompiCardTokenResponseDto>("POST", "/tokens/cards", card);
  }

  async tokenizeNequi(nequi: WompiNequiTokenRequestDto): Promise<WompiNequiTokenResponseDto> {
    return this.send<WompiNequiTokenResponseDto>("POST", "/tokens/nequi", nequi);
  }

  private async send<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${this.publicKey}`,
    };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const init: RequestInit = { method, headers, cache: "no-store" };
    if (body !== undefined) init.body = JSON.stringify(body);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, init);
    } catch {
      throw new ApiRequestError(NETWORK_ERROR_STATUS, ["No se pudo conectar con Wompi."]);
    }

    if (!response.ok) {
      throw new ApiRequestError(response.status, await this.readMessages(response));
    }

    return (await response.json()) as T;
  }

  /** Wompi reports errors as { error: { reason, messages: { field: [..] } } }. */
  private async readMessages(response: Response): Promise<string[]> {
    try {
      const { error } = (await response.json()) as WompiErrorBodyDto;
      const fieldMessages = Object.values(error?.messages ?? {}).flat();
      if (fieldMessages.length > 0) return fieldMessages;
      return error?.reason === undefined ? [] : [error.reason];
    } catch {
      return [];
    }
  }
}
