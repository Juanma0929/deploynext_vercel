/** The shapes of POST /tokens/cards of Wompi, exactly as it sends and receives them. */

export interface WompiCardTokenRequestDto {
  readonly number: string;
  readonly cvc: string;
  /** Two digits, "08". */
  readonly exp_month: string;
  /** Two digits, "29". */
  readonly exp_year: string;
  readonly card_holder: string;
}

export interface WompiCardTokenResponseDto {
  readonly data: {
    readonly id: string;
    readonly brand: string;
    readonly last_four: string;
  };
}

export interface WompiErrorBodyDto {
  readonly error?: {
    readonly type?: string;
    readonly reason?: string;
    readonly messages?: Readonly<Record<string, string[]>>;
  };
}
