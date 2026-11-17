/**
 * The base of every error the app shows to the user. Its message is always
 * written for the user, so presentation only needs errorMessage().
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

/** An entity or value object was asked to exist in an invalid state. */
export class DomainError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/** The message to show for anything that was thrown. */
export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return "Ocurrió un error inesperado.";
}
