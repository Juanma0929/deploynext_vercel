import { isValidEmail } from "@/shared/domain/email";
import { DomainError } from "@/shared/domain/errors";

import type { User } from "../domain/user";
import { PASSWORD_MIN_LENGTH, type NewUser } from "../domain/user-input";
import type { UserRepository } from "../domain/user.repository";

export class CreateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  execute(input: NewUser): Promise<User> {
    const name = input.name.trim();
    const email = input.email.trim();

    if (name === "") throw new DomainError("El nombre es obligatorio.");
    if (!isValidEmail(email)) throw new DomainError("Ingresa un correo válido.");
    if (input.password.length < PASSWORD_MIN_LENGTH) {
      throw new DomainError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
    }

    return this.repository.create({ ...input, name, email });
  }
}
