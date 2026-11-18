import {
  AppError,
  ConflictError,
  ForbiddenError,
  GatewayError,
  NetworkError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/domain/errors";

/**
 * THE mapper of the app: every failed response of the API becomes an error of
 * the domain here, and nowhere else. Features may refine one afterwards
 * (a ConflictError of POST /products is a duplicate barcode), but they never
 * read a status code.
 *
 * - 400: ValidationError. NestJS sends `message` as an array, one per field
 *   ("phoneNumber must have 10 digits"): each one becomes the Spanish message
 *   of its field.
 * - 401: UnauthorizedError (the client has already ended the session).
 * - 403: ForbiddenError (the app shell has already shown a notice).
 * - 404: NotFoundError.
 * - 409: ConflictError, with the business reason the API gave.
 * - 502: GatewayError, which can be retried: nothing changed.
 * - other 5xx: ServerError, which can be retried.
 */
export function toAppError(status: number, messages: readonly string[]): AppError {
  const details = { details: messages };

  switch (status) {
    case 400:
      return toValidationError(messages);
    case 401:
      return new UnauthorizedError(undefined, details);
    case 403:
      // The API writes its 403 for developers ("The user is not an admin").
      return new ForbiddenError(details);
    case 404:
      return new NotFoundError(undefined, details);
    case 409:
      return new ConflictError(messages.length > 0 ? messages.join(" ") : undefined, details);
    case 502:
      return new GatewayError(undefined, details);
  }
  if (status >= 500) return new ServerError(details);
  return new AppError(messages.length > 0 ? messages.join(" ") : "La solicitud no se pudo completar.", details);
}

/** The request never reached the server. */
export function networkError(): NetworkError {
  return new NetworkError();
}

/** Reads `message` from an error body, whether it is a string or an array. */
export function messagesFromBody(body: unknown): string[] {
  if (typeof body !== "object" || body === null) return [];

  const { message, error } = body as { message?: unknown; error?: unknown };

  if (Array.isArray(message)) return message.filter((item): item is string => typeof item === "string");
  if (typeof message === "string") return [message];
  if (typeof error === "string") return [error];
  return [];
}

/**
 * The messages of class-validator start with the name of the field:
 * "salePrice must not be less than 0", "property foo should not exist".
 */
const FIELD_MESSAGE = /^(?:property\s+)?([a-zA-Z][\w]*)(?:\.[\w.]+)?\s+(.+)$/;

/** The Spanish of the messages class-validator writes, by what they say after the field. */
const SPANISH: ReadonlyArray<{ readonly pattern: RegExp; readonly say: (match: RegExpMatchArray) => string }> = [
  { pattern: /^should not be empty$/, say: () => "Este campo es obligatorio." },
  { pattern: /^must be an email$/, say: () => "Escribe un correo válido." },
  { pattern: /^must be an integer number$/, say: () => "Debe ser un número entero." },
  { pattern: /^must be a number/, say: () => "Debe ser un número." },
  { pattern: /^must not be less than (-?\d+)/, say: (m) => `Debe ser mayor o igual a ${m[1]}.` },
  { pattern: /^must not be greater than (-?\d+)/, say: (m) => `Debe ser menor o igual a ${m[1]}.` },
  { pattern: /^must be longer than or equal to (\d+) characters$/, say: (m) => `Debe tener al menos ${m[1]} caracteres.` },
  { pattern: /^must be shorter than or equal to (\d+) characters$/, say: (m) => `Debe tener como máximo ${m[1]} caracteres.` },
  { pattern: /^must have (\d+) digits$/, say: (m) => `Debe tener ${m[1]} dígitos.` },
  { pattern: /^must be a UUID$/, say: () => "El valor elegido no es válido." },
  { pattern: /^must be one of the following values/, say: () => "El valor elegido no es válido." },
  { pattern: /^must be a string$/, say: () => "Debe ser un texto." },
  { pattern: /^must be a boolean value$/, say: () => "Debe ser sí o no." },
  { pattern: /^should not exist$/, say: () => "Este dato no se puede enviar." },
];

function toValidationError(messages: readonly string[]): ValidationError {
  const fieldErrors: Record<string, string> = {};
  const general: string[] = [];

  for (const message of messages) {
    const match = FIELD_MESSAGE.exec(message.trim());
    const field = match?.[1];
    const rest = match?.[2];
    // "Validation failed (uuid is expected)" has no field: it stays general.
    if (field === undefined || rest === undefined || field[0] !== field[0]?.toLowerCase()) {
      general.push(message);
      continue;
    }
    fieldErrors[field] ??= spanishOf(rest) ?? message;
  }

  const hasFields = Object.keys(fieldErrors).length > 0;
  const message = hasFields || general.length === 0 ? undefined : general.join(" ");
  return new ValidationError(fieldErrors, message, { details: messages });
}

function spanishOf(rest: string): string | undefined {
  for (const { pattern, say } of SPANISH) {
    const match = pattern.exec(rest);
    if (match !== null) return say(match);
  }
  return undefined;
}
