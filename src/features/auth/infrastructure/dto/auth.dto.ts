/** Body of POST /auth/login. */
export interface LoginRequestDto {
  readonly email: string;
  readonly password: string;
  readonly code?: string;
}

/** Response of POST /auth/login. */
export interface LoginResponseDto {
  readonly accessToken: string;
}

/** Response of GET /auth/profile: the user without its secrets. */
export interface UserDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly isTwoFactorEnabled: boolean;
}
