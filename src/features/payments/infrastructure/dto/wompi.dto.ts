/** The shapes of the Wompi API, exactly as it sends and receives them. */

export interface WompiMerchantResponseDto {
  readonly data: {
    readonly presigned_acceptance: {
      readonly acceptance_token: string;
      readonly permalink: string;
    };
  };
}

export interface WompiCardTokenRequestDto {
  readonly number: string;
  readonly cvc: string;
  /** Two digits, "08". */
  readonly exp_month: string;
  /** Two digits, "28". */
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

export interface WompiNequiTokenRequestDto {
  readonly phone_number: string;
}

export interface WompiNequiTokenResponseDto {
  readonly data: {
    readonly id: string;
    readonly status: string;
  };
}

export interface WompiErrorBodyDto {
  readonly error?: {
    readonly type?: string;
    readonly reason?: string;
    readonly messages?: Readonly<Record<string, string[]>>;
  };
}
