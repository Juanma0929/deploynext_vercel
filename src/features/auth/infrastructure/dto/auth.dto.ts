/**
 * The JSON the API speaks, exactly as it travels. Nothing outside
 * infrastructure sees these shapes: the mapper turns them into entities.
 */
export interface LoginRequestDto {
  readonly email: string;
  readonly password: string;
  readonly code?: string;
}

export interface LoginResponseDto {
  readonly accessToken: string;
}

/** GET /auth/profile, and every user the API returns. */
export interface UserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled?: boolean;
}
