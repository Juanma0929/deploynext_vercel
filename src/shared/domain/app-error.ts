/**
 * The errors the whole application speaks. Infrastructure turns an HTTP status
 * into one of these, so neither the use cases nor the components ever look at a
 * status code.
 */
export type AppErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "conflict"
  | "gateway"
  | "network"
  | "unexpected";

export class AppError extends Error {
  readonly kind: AppErrorKind;
  /** Field errors as the backend reports them, to show them next to each input. */
  readonly details: readonly string[];

  constructor(kind: AppErrorKind, message: string, details: readonly string[] = []) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Los datos enviados no son válidos.", details: readonly string[] = []) {
    super("validation", message, details);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Tu sesión expiró. Inicia sesión de nuevo.",
    details: readonly string[] = [],
  ) {
    super("unauthorized", message, details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No tienes permiso para realizar esta acción.") {
    super("forbidden", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso no existe.") {
    super("not-found", message);
    this.name = "NotFoundError";
  }
}

/** A business rule rejected the operation: a 409 from the API. */
export class ConflictError extends AppError {
  constructor(message = "La operación no se puede hacer con el estado actual de los datos.") {
    super("conflict", message);
    this.name = "ConflictError";
  }
}

/** The payment gateway failed: a 502 from the API. The operation can be retried. */
export class GatewayError extends AppError {
  constructor(message = "La pasarela de pagos no responde. Intenta de nuevo.") {
    super("gateway", message);
    this.name = "GatewayError";
  }
}

export class NetworkError extends AppError {
  constructor(message = "No pudimos contactar el servidor. Revisa tu conexión.") {
    super("network", message);
    this.name = "NetworkError";
  }
}

/** An invariant of an entity was broken: it is a bug, not something the user did. */
export class DomainError extends AppError {
  constructor(message: string) {
    super("validation", message);
    this.name = "DomainError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function errorMessage(error: unknown): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}
