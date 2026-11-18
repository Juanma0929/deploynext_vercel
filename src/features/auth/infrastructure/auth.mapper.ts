import { UnauthorizedError } from "@/shared/domain/errors";

import type { LoginCredentials } from "../domain/credentials";
import {
  InvalidCredentialsError,
  InvalidTwoFactorCodeError,
  TwoFactorRequiredError,
} from "../domain/errors";
import { User } from "../domain/user";
import type { LoginRequestDto, UserDto } from "./dto/auth.dto";

/** The exact messages the API sends with the 401 of POST /auth/login. */
const API_MESSAGES = {
  twoFactorRequired: "Two-factor code required",
  invalidTwoFactorCode: "Invalid two-factor code",
  invalidCredentials: "Invalid credentials",
} as const;

export function toLoginRequestDto(credentials: LoginCredentials): LoginRequestDto {
  return {
    email: credentials.email,
    password: credentials.password,
    ...(credentials.code !== undefined ? { code: credentials.code } : {}),
  };
}

export function toUser(dto: UserDto): User {
  return new User({
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    isActive: dto.isActive,
    isTwoFactorEnabled: dto.isTwoFactorEnabled,
  });
}

/**
 * Translates a refused login into a domain error. Only the 401 has meaning of
 * its own; anything else (network, 400, 500) is returned unchanged, already
 * translated by the central mapper of the HTTP client.
 */
export function toLoginError(error: unknown): unknown {
  if (!(error instanceof UnauthorizedError)) return error;

  if (error.details.includes(API_MESSAGES.twoFactorRequired)) return new TwoFactorRequiredError();
  if (error.details.includes(API_MESSAGES.invalidTwoFactorCode)) {
    return new InvalidTwoFactorCodeError();
  }
  // "Invalid credentials" also covers an inactive user, and is the safe default.
  return new InvalidCredentialsError();
}
