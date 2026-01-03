import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AccountApi } from "@/account";
import type { Result } from "@/types";

// Mock types for testing
interface MockResponse {
  data?: any;
  error?: any;
  success: boolean;
}

// Helper to create mock fetch response
function createMockFetchResponse(
  body: any,
  status: number,
  headers: Record<string, string> = {}
): Response {
  const response = new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });
  Object.defineProperty(response, "status", { value: status, writable: false });
  Object.defineProperty(response, "ok", { value: status >= 200 && status < 300 });
  return response;
}

describe("AccountApi", () => {
  let accountApi: AccountApi;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    accountApi = new AccountApi("https://test.com");
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("constructor", () => {
    it("should create instance with account subdomain", () => {
      const api = new AccountApi("https://test.com");
      expect(api).toBeInstanceOf(AccountApi);
    });

    it("should handle URLs with existing subdomains", () => {
      const api = new AccountApi("https://api.test.com");
      expect(api).toBeInstanceOf(AccountApi);
    });
  });

  describe("setToken and clearToken", () => {
    it("should set JWT token", () => {
      accountApi.setToken("test-token");
      const api = accountApi as any;
      expect(api._jwtToken).toBe("test-token");
    });

    it("should clear JWT token", () => {
      accountApi.setToken("test-token");
      accountApi.clearToken();
      const api = accountApi as any;
      expect(api._jwtToken).toBeUndefined();
    });
  });

  describe("login", () => {
    it("should successfully login and set token", async () => {
      const mockResponse = {
        success: true,
        data: { token: "jwt-token-123", user: { id: 1 } },
      };
      mockFetch.mockResolvedValue(
        createMockFetchResponse(mockResponse.data, 200)
      );

      const result = await accountApi.login({
        email: "test@test.com",
        password: "password",
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe("jwt-token-123");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://account.test.com/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should handle login failure", async () => {
      const errorResponse = { error: "Invalid credentials" };
      mockFetch.mockResolvedValue(
        createMockFetchResponse(errorResponse, 401)
      );

      const result = await accountApi.login({
        email: "test@test.com",
        password: "wrong",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("logout", () => {
    it("should successfully logout and clear token", async () => {
      accountApi.setToken("test-token");
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 204));

      const result = await accountApi.logout();

      expect(result.success).toBe(true);
      const api = accountApi as any;
      expect(api._jwtToken).toBeUndefined();
    });

    it("should handle logout failure", async () => {
      accountApi.setToken("test-token");
      mockFetch.mockResolvedValue(
        createMockFetchResponse({ error: "Logout failed" }, 500)
      );

      const result = await accountApi.logout();

      expect(result.success).toBe(false);
      const api = accountApi as any;
      expect(api._jwtToken).toBe("test-token"); // Token should not be cleared on error
    });
  });

  describe("register", () => {
    it("should successfully register", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 201));

      const result = await accountApi.register({
        email: "test@test.com",
        password: "password",
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/register"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should handle registration errors", async () => {
      mockFetch.mockResolvedValue(
        createMockFetchResponse({ error: "Email already exists" }, 409)
      );

      const result = await accountApi.register({
        email: "existing@test.com",
        password: "password",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("info", () => {
    it("should get account info", async () => {
      const mockData = {
        id: 1,
        email: "test@test.com",
        username: "testuser",
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.info();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it("should handle unauthorized access", async () => {
      mockFetch.mockResolvedValue(
        createMockFetchResponse({ error: "Unauthorized" }, 401)
      );

      const result = await accountApi.info();

      expect(result.success).toBe(false);
    });
  });

  describe("ping", () => {
    it("should ping and refresh token", async () => {
      const mockData = { message: "pong", token: "new-token" };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.ping();

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe("new-token");
      const api = accountApi as any;
      expect(api._jwtToken).toBe("new-token");
    });
  });

  describe("password reset", () => {
    it("should request password reset", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.requestPasswordReset({
        email: "test@test.com",
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/account/password-reset/request"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should confirm password reset", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.confirmPasswordReset({
        token: "reset-token",
        new_password: "newpassword",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("email verification", () => {
    it("should request email verification resend", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.requestEmailVerification({
        email: "test@test.com",
      });

      expect(result.success).toBe(true);
    });

    it("should verify email without login", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.verifyEmail({
        token: "verify-token",
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.not.stringContaining("login=true"),
        expect.anything()
      );
    });

    it("should verify email with login", async () => {
      const mockResponse = new Response(
        JSON.stringify({}),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
      mockFetch.mockResolvedValue(mockResponse);

      const result = await accountApi.verifyEmail(
        { token: "verify-token" },
        true
      );

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("login=true"),
        expect.anything()
      );
    });
  });

  describe("account updates", () => {
    it("should update email", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.updateEmail(
        "new@test.com",
        "currentpassword"
      );

      expect(result.success).toBe(true);
    });

    it("should update password", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.updatePassword(
        "oldpassword",
        "newpassword"
      );

      expect(result.success).toBe(true);
    });
  });

  describe("OTP methods", () => {
    it("should generate OTP", async () => {
      const mockData = { secret: "ABC123", qr_code: "data:image/png;base64,..." };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.generateOtp();

      expect(result.success).toBe(true);
      expect(result.data?.secret).toBe("ABC123");
    });

    it("should verify OTP", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.verifyOtp({ code: "123456" });

      expect(result.success).toBe(true);
    });

    it("should validate OTP for login", async () => {
      const mockData = { token: "jwt-token", user: { id: 1 } };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.validateOtp({
        otp: "123456",
        login_token: "login-token",
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe("jwt-token");
      const api = accountApi as any;
      expect(api._jwtToken).toBe("jwt-token");
    });

    it("should disable OTP", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      const result = await accountApi.disableOtp({ code: "123456" });

      expect(result.success).toBe(true);
    });
  });

  describe("upload limit", () => {
    it("should get upload limit info", async () => {
      const mockData = {
        used: 1024,
        limit: 10485760,
        remaining: 10484736,
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.uploadLimit();

      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(10485760);
    });
  });

  describe("account deletion", () => {
    it("should request account deletion", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 202));

      const result = await accountApi.requestAccountDeletion();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/account/delete"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("operations", () => {
    it("should list operations", async () => {
      const mockData = {
        items: [
          { id: 1, status: "completed" },
          { id: 2, status: "pending" },
        ],
        total: 2,
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.listOperations();

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(2);
    });

    it("should list operations with filters", async () => {
      const mockData = { items: [], total: 0 };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.listOperations({
        status: "completed",
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("status=completed"),
        expect.anything()
      );
    });

    it("should get operation details", async () => {
      const mockData = {
        id: 1,
        status: "completed",
        result: { success: true },
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.getOperation(1);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(1);
    });

    it("should get operation filters", async () => {
      const mockData = {
        statuses: ["completed", "pending", "failed"],
        types: ["upload", "download"],
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.getOperationFilters();

      expect(result.success).toBe(true);
      expect(result.data?.statuses).toContain("completed");
    });

    it("should wait for operation to complete", async () => {
      const mockData = {
        id: 1,
        status: "completed",
        result: { success: true },
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.waitForOperation(1, { interval: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("completed");
    });

    it("should timeout when waiting for operation", async () => {
      mockFetch.mockImplementation(() =>
        Promise.resolve(
          createMockFetchResponse({ id: 1, status: "pending" }, 200)
        )
      );

      const result = await accountApi.waitForOperation(1, {
        interval: 10,
        timeout: 50,
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Polling timed out");
    });
  });

  describe("authorization headers", () => {
    it("should include JWT token in headers when set", async () => {
      accountApi.setToken("test-token");
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      await accountApi.info();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("should not include authorization header when token not set", async () => {
      mockFetch.mockResolvedValue(createMockFetchResponse({}, 200));

      await accountApi.info();

      const call = mockFetch.mock.calls[0];
      const headers = call[1]?.headers;
      expect(headers?.Authorization).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await accountApi.info();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle JSON parse errors", async () => {
      mockFetch.mockResolvedValue(
        new Response("invalid json", {
          status: 200,
          headers: { "content-length": "12" },
        })
      );

      const result = await accountApi.info();

      expect(result.success).toBe(false);
    });
  });
});
