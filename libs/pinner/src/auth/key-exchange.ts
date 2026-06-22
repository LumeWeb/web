import { jwtDecode } from "jwt-decode";
import { Sdk } from "@lumeweb/portal-sdk";
import { JwtAuthManager } from "./manager";
import { JwtPurpose } from "./types";
import { ConfigurationError } from "@/errors";

/**
 * AuthManager that exchanges an API key JWT for a login JWT when needed.
 *
 * Mirrors the Go SDK's AuthServiceDefault.GetLoginToken():
 * 1. Decode the JWT audience without verification
 * 2. If aud === JwtPurpose.API, call POST /api/auth/key to exchange for a login JWT
 * 3. Use the login JWT for all subsequent requests
 *
 * The exchange happens lazily on first access (getAuthToken/getAuthHeaders)
 * and is cached for the lifetime of the instance.
 */
export class KeyExchangeAuthManager extends JwtAuthManager {
  private resolvedToken = "";
  private exchangePromise?: Promise<string>;
  private readonly sdk: Sdk;

  constructor(jwt: string, endpoint: string) {
    super(jwt);
    // Derive the account endpoint from the pinner endpoint.
    // Go SDK uses hardcoded DefaultEndpoint = "account.pinner.xyz".
    // AccountApi constructor prepends "account." to the hostname,
    // so we strip the first subdomain (e.g. ipfs.pinner.xyz → pinner.xyz)
    // and let AccountApi add "account." → account.pinner.xyz.
    const url = new URL(endpoint);
    const parts = url.hostname.split(".");
    if (parts.length > 2) {
      parts.shift(); // Remove first subdomain (e.g. "ipfs")
    }
    const baseHostname = parts.join(".");
    this.sdk = new Sdk(`${url.protocol}//${baseHostname}`);
  }

  /**
   * Decode the JWT audience without verification.
   * Returns undefined if the token can't be decoded or has no audience.
   */
  private getAudience(): string | undefined {
    try {
      const decoded = jwtDecode(this.token);
      const aud = decoded.aud;
      if (Array.isArray(aud)) {
        return aud[0];
      }
      return typeof aud === "string" ? aud : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Exchange the API key JWT for a login JWT if needed.
   * Returns the login JWT, or the original token if no exchange is necessary.
   */
  private resolveToken(): Promise<string> {
    if (this.resolvedToken) {
      return Promise.resolve(this.resolvedToken);
    }

    if (this.exchangePromise) {
      return this.exchangePromise;
    }

    const aud = this.getAudience();

    if (aud !== JwtPurpose.API) {
      this.resolvedToken = this.token;
      return Promise.resolve(this.resolvedToken);
    }

    this.exchangePromise = (async () => {
      try {
        const result = await this.sdk.account().loginWithApiKey(this.token);

        if (!result.success || !result.data?.token) {
          throw new ConfigurationError(
            "Failed to exchange API key for login JWT",
          );
        }

        this.resolvedToken = result.data.token;
        return this.resolvedToken;
      } catch (err) {
        this.exchangePromise = undefined;
        throw err;
      }
    })();

    return this.exchangePromise;
  }

  async getAuthToken(): Promise<string> {
    return this.resolveToken();
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.resolveToken();
    return { Authorization: `Bearer ${token}` };
  }

  async getAccessToken(): Promise<string> {
    return this.resolveToken();
  }
}
