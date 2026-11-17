/** Where the access token is kept between requests and page loads. */
export interface SessionTokenStore {
  read(): Promise<string | null>;
  save(token: string): Promise<void>;
  clear(): Promise<void>;
}
