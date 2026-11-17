import {
  AppError,
  ConflictError,
  ForbiddenError,
  GatewayError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/domain/app-error";

import type { HttpClient, HttpRequestOptions, QueryValue } from "./http-client";
import type { TokenStorage } from "./token-storage";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

/**
 * The only implementation of HttpClient. It adds the Bearer token to every
 * request (the interceptor the statement asks for) and turns each status code
 * into one of the application errors, so nothing above this file ever sees a
 * number like 409.
 */
export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenStorage: TokenStorage,
  ) {}

  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, body, options);
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  async getBlob(path: string, options?: HttpRequestOptions): Promise<Blob> {
    const response = await this.send("GET", path, undefined, options);
    if (!response.ok) throw await this.toAppError(response);
    return response.blob();
  }

  private async request<T>(
    method: Method,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.send(method, path, body, options);
    if (!response.ok) throw await this.toAppError(response);

    // 204, and any empty body, is a valid answer for a delete or a logout.
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    if (text.length === 0) return undefined as T;
    return JSON.parse(text) as T;
  }

  private async send(
    method: Method,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<Response> {
    const token = await this.tokenStorage.read();
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    // The interceptor: the token is attached here and nowhere else.
    if (token !== null) headers.Authorization = `Bearer ${token}`;

    const init: RequestInit = {
      method,
      headers,
      cache: options?.cache ?? "no-store",
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (options?.signal !== undefined) init.signal = options.signal;

    try {
      return await fetch(this.buildUrl(path, options?.query), init);
    } catch (cause) {
      // fetch only rejects when the request never reached the server.
      throw new NetworkError(
        cause instanceof Error && cause.name === "AbortError"
          ? "La solicitud se canceló."
          : undefined,
      );
    }
  }

  private buildUrl(path: string, query?: Readonly<Record<string, QueryValue>>): string {
    const url = new URL(`${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private async toAppError(response: Response): Promise<AppError> {
    const message = await this.readMessage(response);
    switch (response.status) {
      case 400:
        return new ValidationError(
          "Revisa los datos que ingresaste.",
          message === undefined ? [] : [message],
        );
      case 401:
        // The message stays the Spanish default, because most 401s really are
        // an expired session. The text of the API travels as a detail so a
        // feature that knows better, such as the login, can say something else.
        return new UnauthorizedError(undefined, message === undefined ? [] : [message]);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message);
      case 502:
        return new GatewayError(message);
      default:
        return new AppError("unexpected", message ?? "El servidor no pudo responder la solicitud.");
    }
  }

  private async readMessage(response: Response): Promise<string | undefined> {
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (Array.isArray(body.message)) return body.message.join(" ");
      if (typeof body.message === "string") return body.message;
      return body.error;
    } catch {
      return undefined;
    }
  }
}
