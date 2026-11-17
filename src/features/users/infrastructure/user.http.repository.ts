import type { HttpClient } from "@/shared/infrastructure/http";

import type { NewUser, User, UserChanges } from "../domain/user";
import type { UserRepository } from "../domain/user.repository";
import type { CreateUserDto, UpdateUserDto, UserDto } from "./dto/user.dto";
import { toUser } from "./mappers/user.mapper";

export class UserHttpRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<User[]> {
    const dtos = await this.http.get<UserDto[]>("/users");
    return dtos.map(toUser);
  }

  async getById(id: string): Promise<User> {
    return toUser(await this.http.get<UserDto>(`/users/${id}`));
  }

  async create(user: NewUser): Promise<User> {
    const body: CreateUserDto = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    };

    return toUser(await this.http.post<UserDto>("/users", body));
  }

  async update(id: string, changes: UserChanges): Promise<User> {
    // Only what actually changed travels: PATCH treats a missing field as
    // "leave it alone", and an undefined would be sent as null.
    const body: UpdateUserDto = {
      ...(changes.name === undefined ? {} : { name: changes.name }),
      ...(changes.password === undefined ? {} : { password: changes.password }),
      ...(changes.role === undefined ? {} : { role: changes.role }),
      ...(changes.isActive === undefined ? {} : { isActive: changes.isActive }),
    };

    return toUser(await this.http.patch<UserDto>(`/users/${id}`, body));
  }
}
