import { AppError } from "@/shared/domain/errors";

/** POST /users answered 409: another account already uses that email. */
export class EmailAlreadyRegisteredError extends AppError {
  constructor() {
    super("Ese correo ya está registrado.");
    this.name = "EmailAlreadyRegisteredError";
  }
}
