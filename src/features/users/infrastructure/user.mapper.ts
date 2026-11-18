import { User } from "../domain/user";
import type { NewUser, UserChanges } from "../domain/user-input";
import type { CreateUserDto, UpdateUserDto, UserDto } from "./dto/user.dto";

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

export function toCreateUserDto(user: NewUser): CreateUserDto {
  return { name: user.name, email: user.email, password: user.password, role: user.role };
}

/**
 * Only name, password, role and isActive, and only the ones present. The
 * keys are picked one by one, so an email that sneaks into `changes` (for
 * example from a spread form) never reaches the API.
 */
export function toUpdateUserDto(changes: UserChanges): UpdateUserDto {
  return {
    ...(changes.name !== undefined ? { name: changes.name } : {}),
    ...(changes.password !== undefined ? { password: changes.password } : {}),
    ...(changes.role !== undefined ? { role: changes.role } : {}),
    ...(changes.isActive !== undefined ? { isActive: changes.isActive } : {}),
  };
}
