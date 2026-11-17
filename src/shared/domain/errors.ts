/**
 * The errors the whole frontend speaks. The HTTP client turns every status code
 * into one of these, so no layer above infrastructure ever reads a number like
 * 409, and every message is already written for the user.
 */
export type AppErrorCode =
  | "domain"
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "network"
  | "unexpected";

export class AppError extends Error {
  constructor(
    readonly code: AppErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** An entity was asked to exist in an invalid state. */
export class DomainError extends AppError {
  constructor(message: string) {
    super("domain", message);
    this.name = "DomainError";
  }
}

/** 400: the API rejected the data that was sent. */
export class ValidationError extends AppError {
  constructor(message = "Revisa los datos que ingresaste.") {
    super("validation", message);
    this.name = "ValidationError";
  }
}

/** 401: there is no valid session. */
export class UnauthorizedError extends AppError {
  constructor(message = "Tu sesión no es válida. Inicia sesión de nuevo.") {
    super("unauthorized", message);
    this.name = "UnauthorizedError";
  }
}

/** 403: the session is valid but the role cannot do this. */
export class ForbiddenError extends AppError {
  constructor(message = "No tienes permiso para hacer esto.") {
    super("forbidden", message);
    this.name = "ForbiddenError";
  }
}

/** 404 */
export class NotFoundError extends AppError {
  constructor(message = "El recurso no existe.") {
    super("not-found", message);
    this.name = "NotFoundError";
  }
}

/** 409: the request is valid but clashes with the current state. */
export class ConflictError extends AppError {
  constructor(message = "La operación entra en conflicto con los datos actuales.") {
    super("conflict", message);
    this.name = "ConflictError";
  }
}

/** The request never reached the API. */
export class NetworkError extends AppError {
  constructor(message = "No se pudo conectar con el servidor.") {
    super("network", message);
    this.name = "NetworkError";
  }
}

/** The message to show for anything that was thrown. */
export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return "Ocurrió un error inesperado.";
}
