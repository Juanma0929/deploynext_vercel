import { ApiRequestError, type HttpClient } from "@/shared/infrastructure/http";

import { EmailAlreadyRegisteredError } from "../domain/errors";
import type { User } from "../domain/user";
import type { NewUser, UserChanges } from "../domain/user-input";
import type { UserRepository } from "../domain/user.repository";
import type { UserDto } from "./dto/user.dto";
import { toCreateUserDto, toUpdateUserDto, toUser } from "./user.mapper";

export class UserHttpRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<User[]> {
    const users = await this.http.get<UserDto[]>("/users");
    return users.map(toUser);
  }

  async create(user: NewUser): Promise<User> {
    try {
      return toUser(await this.http.post<UserDto>("/users", toCreateUserDto(user)));
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.status === 409) {
        throw new EmailAlreadyRegisteredError();
      }
      throw error;
    }
  }

  async update(id: string, changes: UserChanges): Promise<User> {
    const path = `/users/${encodeURIComponent(id)}`;
    return toUser(await this.http.patch<UserDto>(path, toUpdateUserDto(changes)));
  }
}
