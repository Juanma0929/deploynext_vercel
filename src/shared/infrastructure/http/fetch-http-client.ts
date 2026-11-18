import { messagesFromBody, networkError, toAppError } from "./api-error-mapper";
import type { HttpClient, HttpRequestOptions, QueryValue } from "./http-client";
import type { TokenStorage } from "./token-storage";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const LOGIN_PATH = "/auth/login";
const HEALTH_PATH = "/health";

/** The endpoints that never carry the Bearer token. */
const PUBLIC_PATHS: ReadonlySet<string> = new Set([LOGIN_PATH, HEALTH_PATH]);

export interface FetchHttpClientConfig {
  readonly baseUrl: string;
  readonly tokenStorage: TokenStorage;
  /** Called after a 401 outside the login, once the token is cleared. */
  readonly onSessionExpired: () => void;
  /** Called on every 403, before the error is thrown to the caller. */
  readonly onForbidden: () => void;
}

/**
 * The only HttpClient of the API. It is the interceptor of the app:
 *
 * - it attaches `Authorization: Bearer <token>` to every request except
 *   /auth/login and /health;
 * - on a 401 outside the login it ends the session: it clears the token and
 *   calls onSessionExpired, which sends the user to /login. A 401 from the
 *   login means wrong credentials, so there it is only an error;
 * - on a 403 it calls onForbidden, so the app can warn the user even if the
 *   caller does not handle the error. The interface hides what a role cannot
 *   do, so a 403 means the hiding missed something or the role just changed;
 * - every failure throws an error of the domain, translated by the central
 *   mapper (toAppError), with `message` read whether the API sent a string
 *   or an array. Nothing above this file ever sees a status code;
 * - a 204 is returned as undefined, without reading the body.
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

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    if (text.length === 0) return undefined as T;
    return JSON.parse(text) as T;
  }

  /** Sends the request and throws an error of the domain for anything that is not 2xx. */
  private async send(
    method: Method,
    path: string,
    body: unknown,
    options?: HttpRequestOptions,
  ): Promise<Response> {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";

    if (!PUBLIC_PATHS.has(normalizedPath)) {
      const token = await this.config.tokenStorage.read();
      if (token !== null) headers.Authorization = `Bearer ${token}`;
    }

    const init: RequestInit = { method, headers, cache: "no-store" };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (options?.signal !== undefined) init.signal = options.signal;

    let response: Response;
    try {
      response = await fetch(this.buildUrl(normalizedPath, options?.query), init);
    } catch {
      throw networkError();
    }

    if (response.ok) return response;

    if (response.status === 401 && normalizedPath !== LOGIN_PATH) {
      await this.config.tokenStorage.clear();
      this.config.onSessionExpired();
    }

    const error = toAppError(response.status, await this.readMessages(response));
    if (response.status === 403) this.config.onForbidden();
    throw error;
  }

  private buildUrl(path: string, query?: Readonly<Record<string, QueryValue>>): string {
    const url = new URL(`${this.config.baseUrl}${path}`);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }

    return url.toString();
  }

  private async readMessages(response: Response): Promise<string[]> {
    try {
      return messagesFromBody(await response.json());
    } catch {
      return [];
    }
  }
}
