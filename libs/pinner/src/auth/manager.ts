import { ConfigurationError } from "@/errors";

/**
 * Interface for authentication management.
 * Provides auth tokens and headers for API requests.
 *
 * This is the single source of truth for auth in the Pinner SDK.
 * All clients receive an AuthManager instance and call getAuthHeaders()
 * or getAuthToken() — never touch config.jwt directly.
 *
 * Methods are async to support token exchange (API key → login JWT).
 */
export interface AuthManager {
  /**
   * Get the raw auth token string.
   * May perform a network call to exchange an API key JWT for a login JWT.
   * Throw ConfigurationError if no token is configured.
   */
  getAuthToken(): Promise<string>;

  /**
   * Get the Authorization header object for use in fetch/ky requests.
   * Example: { Authorization: "Bearer eyJ..." }
   * May perform a network call if token exchange is needed.
   */
  getAuthHeaders(): Promise<Record<string, string>>;

  /**
   * Get the auth token for use with libraries that expect an accessToken field
   * (e.g. @ipfs-shipyard/pinning-service-client Configuration).
   */
  getAccessToken(): Promise<string>;
}

/**
 * Default AuthManager implementation that holds a JWT token.
 *
 * Mirrors the Go SDK's approach: token is set once at construction time
 * and used for all subsequent requests.
 */
export class JwtAuthManager implements AuthManager {
  protected readonly token: string;

  constructor(jwt: string) {
    if (!jwt) {
      throw new ConfigurationError("JWT token is required");
    }
    this.token = jwt;
  }

  async getAuthToken(): Promise<string> {
    return this.token;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    return { Authorization: `Bearer ${this.token}` };
  }

  async getAccessToken(): Promise<string> {
    return this.token;
  }
}
