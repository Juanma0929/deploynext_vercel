import type { LoginCredentials } from "./credentials";
import type { User } from "./user";

/** The port to the authentication endpoints of the API. */
export interface AuthRepository {
  /**
   * Resolves with the access token. Rejects with TwoFactorRequiredError,
   * InvalidCredentialsError or InvalidTwoFactorCodeError when the API refuses.
   */
  login(credentials: LoginCredentials): Promise<string>;

  /** The user the stored token belongs to. */
  getProfile(): Promise<User>;

  /** Invalidates every token of the user, on every device. */
  logout(): Promise<void>;
}
