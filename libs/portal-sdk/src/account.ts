import type { RequestInit } from "./types.js";

import {
  AccountInfoResponse,
  LoginRequest,
  LoginResponse,
  OTPDisableRequest,
  OTPGenerateResponse,
  OTPValidateRequest,
  OTPVerifyRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  PongResponse,
  RegisterRequest,
  ResendVerifyEmailRequest,
  UploadLimitResponse,
  VerifyEmailRequest,
} from "./account/generated";
import {
  AccountError,
  handleFetchError,
  handleUnknownError,
  Result,
} from "./types.js";

export class AccountApi {
  private _jwtToken?: string;
  private readonly apiUrl: string;

  /**
   * Gets the current JWT token
   * @returns {string|undefined} The current JWT token or undefined if not set
   */
  private get jwtToken(): string | undefined {
    return this._jwtToken;
  }

  /**
   * Creates a new AccountApi instance
   * @param {string} apiUrl - The base API URL
   */
  constructor(apiUrl: string) {
    const apiUrlParsed = new URL(apiUrl);
    apiUrlParsed.hostname = `account.${apiUrlParsed.hostname}`;
    this.apiUrl = apiUrlParsed.toString();
  }

  /**
   * Clears the current JWT token
   */
  public clearToken(): void {
    this._jwtToken = undefined;
  }

  /**
   * Confirm a password reset
   * @param passwordResetVerifyRequest Password reset verification details
   * @returns Result indicating success or failure
   */
  public async confirmPasswordReset(
    passwordResetVerifyRequest: PasswordResetVerifyRequest,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/account/password-reset/confirm", {
      body: JSON.stringify(passwordResetVerifyRequest),
      method: "POST",
    });
  }

  /**
   * Disable OTP for two-factor authentication
   * @param otpDisableRequest OTP disable request details
   * @returns Result indicating success or failure
   */
  public async disableOtp(
    otpDisableRequest: OTPDisableRequest,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/auth/otp/disable", {
      body: JSON.stringify(otpDisableRequest),
      method: "POST",
    });
  }

  /**
   * Generate OTP for two-factor authentication
   * @returns Result containing OTP response
   */
  public async generateOtp(): Promise<Result<OTPGenerateResponse>> {
    return this.fetchJson<OTPGenerateResponse>("/api/auth/otp/generate", {
      method: "GET",
    });
  }

  /**
   * Get account information
   * @returns Result containing account info
   */
  public async info(): Promise<Result<AccountInfoResponse>> {
    return this.fetchJson<AccountInfoResponse>("/api/account", {
      method: "GET",
    });
  }

  /**
   * Login to the account service
   * @param loginRequest Login credentials
   * @returns Result containing login response or error
   */
  public async login(
    loginRequest: LoginRequest,
  ): Promise<Result<LoginResponse>> {
    const result = await this.fetchJson<LoginResponse>("/api/auth/login", {
      body: JSON.stringify(loginRequest),
      method: "POST",
    });

    if (result.success && result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  /**
   * Logout from the account service
   * @returns Result indicating success or failure
   */
  public async logout(): Promise<Result<void>> {
    const result = await this.fetchJson<void>("/api/auth/logout", {
      method: "POST",
    });

    if (result.success) {
      this.clearToken();
    }

    return result;
  }

  /**
   * Check authentication status
   * @returns Result containing ping response
   */
  public async ping(): Promise<Result<PongResponse>> {
    const result = await this.fetchJson<PongResponse>("/api/auth/ping", {
      method: "POST",
    });

    if (result.success && result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  /**
   * Register a new account
   * @param registerRequest Registration details
   * @returns Result indicating success or failure
   */
  public async register(
    registerRequest: RegisterRequest,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/auth/register", {
      body: JSON.stringify(registerRequest),
      method: "POST",
    });
  }

  /**
   * Request account deletion
   * @returns Result indicating success or failure
   */
  public async requestAccountDeletion(): Promise<Result<void>> {
    return this.fetchJson<void>("/api/account/delete", {
      method: "DELETE",
    });
  }

  /**
   * Request email verification to be resent
   * @param resendRequest Email details for verification
   * @returns Result indicating success or failure
   */
  public async requestEmailVerification(
    resendRequest: ResendVerifyEmailRequest,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/account/verify-email/resend", {
      body: JSON.stringify(resendRequest),
      method: "POST",
    });
  }

  /**
   * Request a password reset
   * @param passwordResetRequest Password reset request details
   * @returns Result indicating success or failure
   */
  public async requestPasswordReset(
    passwordResetRequest: PasswordResetRequest,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/account/password-reset/request", {
      body: JSON.stringify(passwordResetRequest),
      method: "POST",
    });
  }

  /**
   * Sets the JWT token for authentication
   * @param {string} token - The JWT token to set
   */
  public setToken(token: string): void {
    this._jwtToken = token;
  }

  /**
   * Update account email address
   * @param email New email address
   * @param password Current password for verification
   * @returns Result indicating success or failure
   */
  public async updateEmail(
    email: string,
    password: string,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/account/update-email", {
      body: JSON.stringify({ email, password }),
      method: "POST",
    });
  }

  /**
   * Update account password
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @returns Result indicating success or failure
   */
  public async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/account/update-password", {
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
      method: "POST",
    });
  }

  /**
   * Get upload limit information
   * @returns Result containing upload limit info
   */
  public async uploadLimit(): Promise<Result<UploadLimitResponse>> {
    return this.fetchJson<UploadLimitResponse>("/api/upload-limit", {
      method: "GET",
    });
  }

  /**
   * Validate OTP for two-factor authentication login
   * @param otpValidateRequest OTP validation details
   * @returns Result containing login response
   */
  public async validateOtp(
    otpValidateRequest: OTPValidateRequest,
  ): Promise<Result<LoginResponse>> {
    const result = await this.fetchJson<LoginResponse>(
      "/api/auth/otp/validate",
      {
        body: JSON.stringify(otpValidateRequest),
        method: "POST",
      },
    );

    if (result.success && result.data?.token) {
      this.setToken(result.data.token);
    }

    return result;
  }

  /**
   * Verify email address
   * @param verifyEmailRequest Email verification details
   * @param login Optional flag to enable auto-login after verification
   * @returns Result indicating success or failure
   */
  public async verifyEmail(
    verifyEmailRequest: VerifyEmailRequest,
    login?: boolean,
  ): Promise<Result<void>> {
    const url = new URL("/api/account/verify-email", this.apiUrl);
    if (login === true) {
      url.searchParams.set("login", "true");
    }
    return this.fetchJson<void>(url.toString(), {
      body: JSON.stringify(verifyEmailRequest),
      method: "POST",
    });
  }

  /**
   * Verify OTP for enabling two-factor authentication
   * @param otpVerifyRequest OTP verification details
   * @returns Result indicating success or failure
   */
  public async verifyOtp(
    otpVerifyRequest: OTPVerifyRequest,
  ): Promise<Result<void>> {
    return this.fetchJson<void>("/api/auth/otp/verify", {
      body: JSON.stringify(otpVerifyRequest),
      method: "POST",
    });
  }

  /**
   * Builds fetch options with authorization headers
   * @param {RequestInit} [init] - Optional initial request options
   * @returns {RequestInit} The constructed request options
   * @private
   */
  private buildOptions(init: RequestInit = {}): RequestInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...init.headers!,
    };

    if (this.jwtToken) {
      headers.Authorization = `Bearer ${this.jwtToken}`;
    }

    return {
      ...init,
      credentials: "include",
      headers,
    };
  }

  /**
   * Makes a JSON request to the API
   * @template T
   * @param {string} input - The API endpoint path or absolute URL
   * @param {RequestInit} [init] - Optional request initialization
   * @returns {Promise<Result<T>>} Promise resolving to the result
   * @private
   */
  private async fetchJson<T>(
    input: string,
    init: RequestInit = {},
  ): Promise<Result<T>> {
    try {
      const response = await fetch(
        new URL(input, this.apiUrl).toString(),
        this.buildOptions(init),
      );

      if (!response.ok) {
        return {
          error: await handleFetchError(response),
          success: false,
        };
      }

      // Handle empty responses
      if (this.isResponseEmpty(response)) {
        return {
          data: undefined as unknown as T,
          success: true,
        };
      }

      // Try to parse JSON, but handle cases where parsing fails due to empty body
      try {
        const data = await response.json();
        return {
          data: data as T,
          success: true,
        };
      } catch (parseError) {
        // If JSON parsing fails (e.g., SyntaxError for empty body), treat as no content
        // Also check for zero content-length header
        if (this.isResponseEmpty(response)) {
          return {
            data: undefined as unknown as T,
            success: true,
          };
        }
        // Re-throw other errors
        throw parseError;
      }
    } catch (e) {
      let error: AccountError;
      if (e instanceof Response) {
        error = await handleFetchError(e);
      } else {
        error = await handleUnknownError(e);
      }
      return {
        error,
        success: false,
      };
    }
  }

  /**
   * Checks if a response has an empty body based on status code or content-length header
   * @param {Response} response - The response to check
   * @returns {boolean} True if the response is empty, false otherwise
   * @private
   */
  private isResponseEmpty(response: Response): boolean {
    // Handle empty responses by status code
    if (
      response.status === 204 ||
      response.status === 205 ||
      response.status === 304
    ) {
      return true;
    }

    // Check content-length header for zero-length body
    const contentLength = response.headers.get("content-length");
    return <boolean>(
      (contentLength === "0" ||
        (contentLength && parseInt(contentLength, 10) === 0))
    );
  }
}
