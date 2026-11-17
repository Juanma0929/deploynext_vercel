import { UnauthorizedError } from "@/shared/domain/app-error";
import type { HttpClient } from "@/shared/infrastructure/http";

import type { AuthenticatedUser } from "../domain/authenticated-user";
import type { AuthRepository } from "../domain/auth.repository";
import type { Credentials } from "../domain/credentials";
import type { LoginRequestDto, LoginResponseDto, UserDto } from "./dto/auth.dto";
import { toAuthenticatedUser } from "./mappers/user.mapper";

/**
 * A 401 while logging in does not mean the session expired: there was no
 * session yet. It means the credentials are wrong, or that the account asks for
 * a two-factor code, and those read very differently to whoever is typing.
 */
function loginFailureMessage(apiMessage: string | undefined): string {
  if (apiMessage === undefined) return "Correo o contraseña incorrectos.";
  if (apiMessage.includes("Two-factor code required")) {
    return "Esta cuenta usa verificación en dos pasos: ingresa el código de 6 dígitos.";
  }
  if (apiMessage.toLowerCase().includes("two-factor")) {
    return "El código de verificación no es válido.";
  }
  return "Correo o contraseña incorrectos.";
}

/** The implementation of the port over the shared HTTP client. */
export class AuthHttpRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async login(credentials: Credentials): Promise<string> {
    const body: LoginRequestDto = {
      email: credentials.email,
      password: credentials.password,
      ...(credentials.twoFactorCode === undefined
        ? {}
        : { code: credentials.twoFactorCode }),
    };

    try {
      const response = await this.http.post<LoginResponseDto>("/auth/login", body);
      return response.accessToken;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedError(loginFailureMessage(error.details[0]));
      }
      throw error;
    }
  }

  async profile(): Promise<AuthenticatedUser> {
    return toAuthenticatedUser(await this.http.get<UserDto>("/auth/profile"));
  }

  async logout(): Promise<void> {
    await this.http.post<void>("/auth/logout");
  }
}
