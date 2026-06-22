/**
 * JWT token purposes, mirroring the Go SDK's jwt.Purpose enum.
 *
 * The audience claim in a JWT determines the token's intended use.
 * @see go.lumeweb.com/portal-middleware/auth/jwt.Purpose
 */
export enum JwtPurpose {
  /** Login session token */
  Login = "login",
  /** Two-factor authentication token */
  TwoFactor = "2fa",
  /** API key token (must be exchanged for a login JWT) */
  API = "api",
}
