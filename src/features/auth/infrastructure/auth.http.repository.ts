import type { HttpClient } from "@/shared/infrastructure/http";

import type { AuthenticatedUser } from "../domain/authenticated-user";
import type { AuthRepository } from "../domain/auth.repository";
import type { Credentials } from "../domain/credentials";
import type { LoginRequestDto, LoginResponseDto, UserDto } from "./dto/auth.dto";
import { toAuthenticatedUser } from "./mappers/user.mapper";

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

    const response = await this.http.post<LoginResponseDto>("/auth/login", body);
    return response.accessToken;
  }

  async profile(): Promise<AuthenticatedUser> {
    return toAuthenticatedUser(await this.http.get<UserDto>("/auth/profile"));
  }

  async logout(): Promise<void> {
    await this.http.post<void>("/auth/logout");
  }
}
