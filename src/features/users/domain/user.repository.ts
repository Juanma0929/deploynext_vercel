import type { User } from "./user";
import type { NewUser, UserChanges } from "./user-input";

/** The port to /users. Only an admin may call it. */
export interface UserRepository {
  list(): Promise<User[]>;
  /** Rejects with EmailAlreadyRegisteredError when the email is taken. */
  create(user: NewUser): Promise<User>;
  update(id: string, changes: UserChanges): Promise<User>;
}
