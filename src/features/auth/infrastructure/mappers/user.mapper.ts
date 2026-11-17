import { AuthenticatedUser } from "../../domain/authenticated-user";
import { toRole } from "../../domain/role";
import type { UserDto } from "../dto/auth.dto";

/**
 * The only place that knows the names of the fields in the API's JSON. The
 * entity validates what arrives, so a malformed answer fails here and not three
 * screens later.
 */
export function toAuthenticatedUser(dto: UserDto): AuthenticatedUser {
  return new AuthenticatedUser({
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: toRole(dto.role),
    isActive: dto.isActive,
    isTwoFactorEnabled: dto.isTwoFactorEnabled ?? false,
  });
}
