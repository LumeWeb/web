import { ConfigurationError } from "@/errors";

/**
 * Interface for authentication management.
 * Provides auth tokens and headers for API requests.
 *
 * This is the single source of truth for auth in the Pinner SDK.
 * All clients receive an AuthManager instance and call getAuthHeaders()
 * or getAuthToken() — never touch config.jwt directly.
 */
export interface AuthManager {
  /**
   * Get the raw auth token string.
   * Throw ConfigurationError if no token is configured.
   */
  getAuthToken(): string;

  /**
   * Get the Authorization header object for use in fetch/ky requests.
   * Example: { Authorization: "Bearer eyJ..." }
   */
  getAuthHeaders(): Record<string, string>;

  /**
   * Get the auth token for use with libraries that expect an accessToken field
   * (e.g. @ipfs-shipyard/pinning-service-client Configuration).
   */
  getAccessToken(): string;
}

/**
 * Default AuthManager implementation that holds a JWT token.
 *
 * Mirrors the Go SDK's approach: token is set once at construction time
 * and used for all subsequent requests. If token exchange (API key → login JWT)
 * is needed in the future, it goes here — one place, not scattered across clients.
 */
export class JwtAuthManager implements AuthManager {
  private readonly token: string;

  constructor(jwt: string) {
    if (!jwt) {
      throw new ConfigurationError("JWT token is required");
    }
    this.token = jwt;
  }

  getAuthToken(): string {
    return this.token;
  }

  getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.token}` };
  }

  getAccessToken(): string {
    return this.token;
  }
}
