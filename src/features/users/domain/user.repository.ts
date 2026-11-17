import type { NewUser, User, UserChanges } from "./user";

/**
 * The port for administering users. Every one of these endpoints is
 * admin-only in the API; the interface hides them from a seller, and the API
 * is what actually refuses.
 */
export interface UserRepository {
  list(): Promise<User[]>;
  getById(id: string): Promise<User>;
  create(user: NewUser): Promise<User>;
  update(id: string, changes: UserChanges): Promise<User>;
}
