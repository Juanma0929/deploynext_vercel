/**
 * The errors of the app. Every failure the user can see is one of these, with
 * a message already written for the user, so presentation only needs
 * errorMessage() and never reads an HTTP status.
 *
 * The HTTP client turns each failed response into one of them through a
 * single mapper (shared/infrastructure/http/api-error-mapper.ts); a feature
 * may then turn a generic one into its own ("the barcode is taken").
 */

export interface AppErrorOptions {
  /** Trying the same thing again may work: the server or the network failed, nothing changed. */
  readonly isRetryable?: boolean;
  /**
   * What the API said, as it said it. A feature can recognise a known message
   * here and say it its own way; the user never reads these directly.
   */
  readonly details?: readonly string[];
}

export class AppError extends Error {
  readonly isRetryable: boolean;
  readonly details: readonly string[];

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    this.isRetryable = options.isRetryable ?? false;
    this.details = options.details ?? [];
  }
}

/** An entity or value object was asked to exist in an invalid state. */
export class DomainError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * 400: the API refused the data. When it says which fields (NestJS sends one
 * message per field), `fieldErrors` has the Spanish message of each, keyed by
 * the name of the field in the API.
 */
export class ValidationError extends AppError {
  constructor(
    readonly fieldErrors: Readonly<Record<string, string>>,
    message = "Revisa los datos que ingresaste.",
    options: AppErrorOptions = {},
  ) {
    super(message, options);
    this.name = "ValidationError";
  }

  /** The errors of the given fields only, for a form that has those fields. */
  errorsFor<F extends string>(fields: readonly F[]): Partial<Record<F, string>> {
    const errors: Partial<Record<F, string>> = {};
    for (const field of fields) {
      const message = this.fieldErrors[field];
      if (message !== undefined) errors[field] = message;
    }
    return errors;
  }
}

/** 401: there is no valid session. The HTTP client already sent the user to the login. */
export class UnauthorizedError extends AppError {
  constructor(message = "Tu sesión no es válida. Inicia sesión de nuevo.", options: AppErrorOptions = {}) {
    super(message, options);
    this.name = "UnauthorizedError";
  }
}

/** 403: the session is valid, but the role cannot do this. */
export class ForbiddenError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super("No tienes permiso para hacer esto.", options);
    this.name = "ForbiddenError";
  }
}

/** 404 */
export class NotFoundError extends AppError {
  constructor(message = "Lo que buscas no existe o fue eliminado.", options: AppErrorOptions = {}) {
    super(message, options);
    this.name = "NotFoundError";
  }
}

/**
 * 409: the request is valid, but a business rule refuses it (not enough
 * stock, a sale already paid). The message is the reason the API gave.
 */
export class ConflictError extends AppError {
  constructor(message = "La operación entra en conflicto con los datos actuales.", options: AppErrorOptions = {}) {
    super(message, options);
    this.name = "ConflictError";
  }
}

/** 502: a service behind the API (Wompi) failed. Nothing changed, so it can be retried. */
export class GatewayError extends AppError {
  constructor(
    message = "Un servicio externo no respondió a tiempo. No se cambió nada: inténtalo de nuevo.",
    options: AppErrorOptions = {},
  ) {
    super(message, { ...options, isRetryable: true });
    this.name = "GatewayError";
  }
}

/** The request never reached the server: no connection, or it timed out. */
export class NetworkError extends AppError {
  constructor(message = "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.") {
    super(message, { isRetryable: true });
    this.name = "NetworkError";
  }
}

/** Any other 5xx: the server failed. It may work a moment later. */
export class ServerError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super("El servidor tuvo un problema. Inténtalo de nuevo en un momento.", { ...options, isRetryable: true });
    this.name = "ServerError";
  }
}

/** The message to show for anything that was thrown. */
export function errorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return "Ocurrió un error inesperado.";
}

/** Whether offering "Reintentar" makes sense for this error. */
export function isRetryable(error: unknown): boolean {
  return error instanceof AppError && error.isRetryable;
}
