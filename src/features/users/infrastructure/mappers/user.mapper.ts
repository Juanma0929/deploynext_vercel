import { toRole } from "@/shared/domain/role";

import { User } from "../../domain/user";
import type { UserDto } from "../dto/user.dto";

/** The only place that knows the field names of the API for a user. */
export function toUser(dto: UserDto): User {
  return new User({
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: toRole(dto.role),
    isActive: dto.isActive,
  });
}
