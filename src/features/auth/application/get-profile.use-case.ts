import type { AuthRepository } from "../domain/auth.repository";
import type { User } from "../domain/user";

/** The logged-in user, whose role decides the navigation. */
export class GetProfileUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(): Promise<User> {
    return this.repository.getProfile();
  }
}
