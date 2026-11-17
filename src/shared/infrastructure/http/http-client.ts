export type QueryValue = string | number | boolean | undefined | null;

export interface HttpRequestOptions {
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly signal?: AbortSignal;
  /** Next.js caching for requests made from a Server Component. */
  readonly cache?: RequestCache;
}

/**
 * The single door to the network. Every repository depends on this port, so the
 * token, the base URL and the translation of HTTP errors live in one place and
 * no component builds its own headers.
 */
export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  /** For the binary endpoints, such as the sales report in PDF. */
  getBlob(path: string, options?: HttpRequestOptions): Promise<Blob>;
}
