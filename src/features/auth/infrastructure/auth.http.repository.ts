import type { HttpClient } from "@/shared/infrastructure/http";

import type { AuthRepository } from "../domain/auth.repository";
import type { LoginCredentials } from "../domain/credentials";
import type { User } from "../domain/user";
import { toLoginError, toLoginRequestDto, toUser } from "./auth.mapper";
import type { LoginResponseDto, UserDto } from "./dto/auth.dto";

export class AuthHttpRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await this.http.post<LoginResponseDto>(
        "/auth/login",
        toLoginRequestDto(credentials),
      );
      return response.accessToken;
    } catch (error: unknown) {
      throw toLoginError(error);
    }
  }

  async getProfile(): Promise<User> {
    return toUser(await this.http.get<UserDto>("/auth/profile"));
  }

  async logout(): Promise<void> {
    // 204 No Content: the client returns undefined without reading a body.
    await this.http.post<void>("/auth/logout");
  }
}
