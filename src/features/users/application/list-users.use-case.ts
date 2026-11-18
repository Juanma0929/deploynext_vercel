import type { User } from "../domain/user";
import type { UserRepository } from "../domain/user.repository";

/** Every user, ordered by name. Pagination and search happen in the front. */
export class ListUsersUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(): Promise<User[]> {
    const users = await this.repository.list();
    return users.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
}
