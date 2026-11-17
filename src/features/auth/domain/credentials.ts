/** What POST /auth/login receives. `code` goes only when the account has 2FA. */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly code?: string;
}

/** The authenticator code: exactly six digits. */
export const TWO_FACTOR_CODE_PATTERN = /^\d{6}$/;

export function isValidTwoFactorCode(value: string): boolean {
  return TWO_FACTOR_CODE_PATTERN.test(value);
}
