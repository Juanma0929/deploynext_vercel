import { AppError } from "@/shared/domain/errors";

/** Status used when the request never reached the server. */
export const NETWORK_ERROR_STATUS = 0;

/**
 * The error every failed request throws. It extends AppError, so presentation
 * shows it with errorMessage() without importing infrastructure.
 *
 * NestJS sends `message` as a string, or as an array when the validation pipe
 * rejects several fields. Both arrive here as `messages`, and `message` joins
 * them for display.
 */
export class ApiRequestError extends AppError {
  readonly messages: readonly string[];

  constructor(
    readonly status: number,
    messages: readonly string[],
  ) {
    super(messages.length > 0 ? messages.join(" ") : defaultMessage(status));
    this.name = "ApiRequestError";
    this.messages = messages;
  }

  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
  }
}

function defaultMessage(status: number): string {
  switch (status) {
    case NETWORK_ERROR_STATUS:
      return "No se pudo conectar con el servidor.";
    case 400:
      return "Revisa los datos que ingresaste.";
    case 401:
      return "Tu sesión no es válida. Inicia sesión de nuevo.";
    case 403:
      return "No tienes permiso para hacer esto.";
    case 404:
      return "El recurso no existe.";
    case 409:
      return "La operación entra en conflicto con los datos actuales.";
    default:
      return "El servidor no pudo responder la solicitud.";
  }
}

/** Reads `message` from an error body, whether it is a string or an array. */
export function messagesFromBody(body: unknown): string[] {
  if (typeof body !== "object" || body === null) return [];

  const { message, error } = body as { message?: unknown; error?: unknown };

  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === "string");
  }
  if (typeof message === "string") return [message];
  if (typeof error === "string") return [error];
  return [];
}
