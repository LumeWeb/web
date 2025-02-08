import type { AuthError } from "@/types";
import type {
  AuthActionResponse,
  AuthProvider,
  CheckResponse,
  IdentityResponse,
  OnErrorResponse,
  PermissionResponse,
} from "@refinedev/core";

import {
  exchangeToken,
  getReportStatus,
  refreshToken,
  validateToken,
} from "../client";

const JWT_KEY = "abuseJwtToken";
const EXPIRES_KEY = "abuseTokenExpires";
const REFERENCE_KEY = "caseReferenceNumber";

export const authProvider: AuthProvider = {
  async check(): Promise<CheckResponse> {
    const jwt = localStorage.getItem(JWT_KEY);
    const expires = localStorage.getItem(EXPIRES_KEY);
    const reference = localStorage.getItem(REFERENCE_KEY);

    if (jwt && expires && reference) {
      // Check token expiration
      const expirationDate = new Date(expires);
      if (new Date() < expirationDate) {
        return { authenticated: true };
      }

      // Attempt token refresh
      try {
        const refreshResponse = await refreshToken({ token: jwt });
        if (refreshResponse.status === 200) {
          const exchange = await exchangeToken({
            token: refreshResponse.data.token,
          });
          localStorage.setItem(JWT_KEY, exchange.data.access_token);
          localStorage.setItem(EXPIRES_KEY, exchange.data.expires_at);
          return { authenticated: true };
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }

    return {
      authenticated: false,
      redirectTo: "/case/access",
    };
  },

  async getIdentity(): Promise<IdentityResponse> {
    const reference = localStorage.getItem(REFERENCE_KEY);
    if (!reference) return null;

    try {
      const { data } = await getReportStatus(reference);
      return {
        id: data.confirmation_number,
        name: `Case #${data.confirmation_number}`,
        ...data,
      };
    } catch (error) {
      console.error("Failed to fetch case details:", error);
      return {
        id: reference,
        name: `Case #${reference}`,
      };
    }
  },

  async getPermissions(): Promise<PermissionResponse> {
    const token = localStorage.getItem(JWT_KEY);
    return token ? ["view-case", "manage-case"] : [];
  },

  async login({ accessKey }): Promise<AuthActionResponse> {
    try {
      // First validate the legacy token
      const validation = await validateToken({ token: accessKey });

      if (validation.status !== 200 || !validation.data.valid) {
        return {
          error: {
            message: "Invalid or expired access token",
            name: "LoginError",
            statusCode: validation.status,
          } as AuthError,
          success: false,
        };
      }

      if (!validation.data.reference) {
        return {
          error: {
            message: "Missing case reference in validation response",
            name: "LoginError",
          },
          success: false,
        };
      }

      // Exchange legacy token for JWT
      const exchange = await exchangeToken({ token: accessKey });

      if (exchange.status !== 200 || !exchange.data.access_token) {
        return {
          error: {
            message: "Failed to exchange token for JWT",
            name: "LoginError",
          },
          success: false,
        };
      }

      // Store JWT and expiration
      localStorage.setItem(JWT_KEY, exchange.data.access_token);
      localStorage.setItem(EXPIRES_KEY, exchange.data.expires_at);
      localStorage.setItem(REFERENCE_KEY, validation.data.reference);

      return {
        redirectTo: `/case/${validation.data.reference}`,
        success: true,
      };
    } catch (error) {
      return {
        error: {
          message: "Failed to validate access token",
          name: "LoginError",
          statusCode: Number(error.status) || 500,
        },
        success: false,
      };
    }
  },

  async logout(): Promise<AuthActionResponse> {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(REFERENCE_KEY);
    return {
      redirectTo: "/case/access",
      success: true,
    };
  },

  async onError(error): Promise<OnErrorResponse> {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return { logout: true, redirectTo: "/case/access" };
    }
    return {};
  },
};
