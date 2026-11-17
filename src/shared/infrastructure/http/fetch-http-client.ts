import {
  AppError,
  ConflictError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/domain/errors";

import type { HttpClient, HttpRequestOptions, QueryValue } from "./http-client";
import type { TokenStorage } from "./token-storage";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiErrorBody {
  readonly message?: string | string[];
  readonly error?: string;
}

export interface FetchHttpClientConfig {
  readonly baseUrl: string;
  readonly tokenStorage: TokenStorage;
  /** Called after a 401 on an authenticated request, once the token is cleared. */
  readonly onSessionExpired: () => void;
}

/**
 * The only HttpClient. It is the interceptor of the app:
 *
 * - it attaches `Authorization: Bearer <token>` to every request;
 * - on a 401 to a request that carried a token, it ends the session: it clears
 *   the token and calls onSessionExpired, which sends the user to /login.
 *   A 401 without a token (wrong credentials at login) is just an error;
 * - it turns every other status into one of the application errors.
 */
export class FetchHttpClient implements HttpClient {
  constructor(private readonly config: FetchHttpClientConfig) {}

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
    return response.blob();
  }

  private async request<T>(
    method: Method,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const response = await this.send(method, path, body, options);

    const text = await response.text();
    if (text.length === 0) return undefined as T;
    return JSON.parse(text) as T;
  }

  /** Sends the request and throws an AppError for anything that is not 2xx. */
  private async send(
    method: Method,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<Response> {
    const token = await this.config.tokenStorage.read();

    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token !== null) headers.Authorization = `Bearer ${token}`;

    const init: RequestInit = { method, headers, cache: "no-store" };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (options?.signal !== undefined) init.signal = options.signal;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(path, options?.query), init);
    } catch {
      throw new NetworkError();
    }

    if (response.ok) return response;

    if (response.status === 401 && token !== null) {
      await this.config.tokenStorage.clear();
      this.config.onSessionExpired();
    }

    throw await this.toAppError(response);
  }

  private buildUrl(path: string, query?: Readonly<Record<string, QueryValue>>): string {
    const url = new URL(`${this.config.baseUrl}${path.startsWith("/") ? path : `/${path}`}`);

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
        return new ValidationError(message);
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message);
      default:
        return new AppError("unexpected", message ?? "El servidor no pudo responder la solicitud.");
    }
  }

  private async readMessage(response: Response): Promise<string | undefined> {
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (Array.isArray(body.message)) return body.message.join(" ");
      return body.message ?? body.error;
    } catch {
      return undefined;
    }
  }
}
