export type QueryValue = string | number | boolean | null | undefined;

export interface HttpRequestOptions {
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly signal?: AbortSignal;
}

/**
 * The port every HTTP repository depends on. There is one implementation,
 * FetchHttpClient, and it is created only in di/.
 */
export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  /** For files such as PDFs: a plain link would not carry the Bearer token. */
  getBlob(path: string, options?: HttpRequestOptions): Promise<Blob>;
}
