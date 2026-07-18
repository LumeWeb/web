import { describe, expect, it } from "vitest";
import {
  AccountError,
  handleFetchError,
  handleUnknownError,
  type Result,
} from "@/types";

describe("AccountError", () => {
  it("should create error with message and status code", () => {
    const error = new AccountError("Test error", 404);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe("AccountError");
  });

  it("should include details", () => {
    const details = { field: "value" };
    const error = new AccountError("Test error", 400, details);
    expect(error.details).toEqual(details);
  });

  it("should include fields", () => {
    const fields = { email: "Invalid email format" };
    const error = new AccountError("Test error", 400, undefined, fields);
    expect(error.fields).toEqual(fields);
  });

  it("should serialize to JSON", () => {
    const error = new AccountError(
      "Test error",
      400,
      { detail: "info" },
      { field: "error" }
    );
    const json = error.toJSON();
    expect(json).toEqual({
      message: "Test error",
      statusCode: 400,
      details: { detail: "info" },
      fields: { field: "error" },
    });
  });
});

describe("handleFetchError", () => {
  it("should handle JSON error response with error.message", async () => {
    const response = new Response(
      JSON.stringify({ error: { message: "Invalid data" } }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error).toBeInstanceOf(AccountError);
    expect(error.message).toBe("Invalid data");
    expect(error.statusCode).toBe(400);
  });

  it("should handle JSON error response with error.reason (canonical shape)", async () => {
    const response = new Response(
      JSON.stringify({ error: { reason: "Unauthorized", details: "Token expired" } }),
      { status: 401, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.message).toBe("Unauthorized");
    expect(error.statusCode).toBe(401);
    expect(error.details).toBe("Token expired");
  });

  it("should handle JSON error response with error string", async () => {
    const response = new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });

    const error = await handleFetchError(response);
    expect(error.message).toBe("Not found");
    expect(error.statusCode).toBe(404);
  });

  it("should handle JSON error response with message field", async () => {
    const response = new Response(
      JSON.stringify({ message: "Authentication failed" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.message).toBe("Authentication failed");
    expect(error.statusCode).toBe(401);
  });

  it("should handle JSON error response with details and fields", async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          message: "Validation failed",
          details: { type: "email" },
          fields: { email: "Invalid format" },
        },
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.message).toBe("Validation failed");
    expect(error.details).toEqual({ type: "email" });
    expect(error.fields).toEqual({ email: "Invalid format" });
  });

  it("should handle JSON error response with fields array", async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          message: "Multiple errors",
          fields: { tags: ["required", "must be array"] },
        },
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.fields).toEqual({ tags: "required, must be array" });
  });

  it("should handle plain text response", async () => {
    const response = new Response("Internal server error", { status: 500 });

    const error = await handleFetchError(response);
    expect(error.message).toBe("Internal server error");
    expect(error.statusCode).toBe(500);
  });

  it("should handle empty response with status text", async () => {
    const response = new Response("", { status: 403, statusText: "Forbidden" });

    const error = await handleFetchError(response);
    expect(error.message).toBe("Forbidden");
    expect(error.statusCode).toBe(403);
  });

  it("should handle invalid JSON by falling back to text", async () => {
    const response = new Response("not valid json {", {
      status: 500,
      headers: { "content-type": "application/json" },
    });

    const error = await handleFetchError(response);
    expect(error.message).toContain("not valid json");
  });

  it("should handle nested fields from error object", async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          message: "Error occurred",
          fields: { password: "Too short", email: "Invalid" },
        },
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.fields).toEqual({ password: "Too short", email: "Invalid" });
  });

  it("should handle fields at top level", async () => {
    const response = new Response(
      JSON.stringify({
        message: "Validation error",
        fields: { name: "Required" },
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.fields).toEqual({ name: "Required" });
  });

  it("should handle null fields", async () => {
    const response = new Response(
      JSON.stringify({
        error: { message: "Test", fields: { value: null } },
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.fields).toEqual({ value: "" });
  });

  it("should handle object fields by stringifying", async () => {
    const response = new Response(
      JSON.stringify({
        error: { message: "Test", fields: { meta: { key: "value" } } },
      }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    const error = await handleFetchError(response);
    expect(error.fields?.meta).toBe('{"key":"value"}');
  });

  it("should handle malformed JSON gracefully", async () => {
    const response = new Response(
      JSON.stringify({ error: "Test" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );

    // Make the body invalid by returning something different
    const errorResponse = new Response("malformed", {
      status: 400,
      headers: { "content-type": "application/json" },
    });

    const error = await handleFetchError(errorResponse);
    expect(error.message).toBe("malformed");
    expect(error.statusCode).toBe(400);
  });
});

describe("handleUnknownError", () => {
  it("should return AccountError for AccountError input", () => {
    const originalError = new AccountError("Original error", 400);
    const result = handleUnknownError(originalError);
    expect(result).toBe(originalError);
  });

  it("should convert Error to AccountError", () => {
    const error = new Error("Standard error");
    const result = handleUnknownError(error);
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBe("Standard error");
    expect(result.statusCode).toBe(500);
    expect(result.details?.cause).toBe(error);
  });

  it("should convert string to AccountError", () => {
    const result = handleUnknownError("String error");
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBe("String error");
    expect(result.statusCode).toBe(500);
  });

  it("should convert number to AccountError", () => {
    const result = handleUnknownError(404);
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBe("404");
    expect(result.statusCode).toBe(500);
  });

  it("should convert plain object to AccountError", () => {
    const obj = { message: "Object error", code: "ERR_001" };
    const result = handleUnknownError(obj);
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBe('{"message":"Object error","code":"ERR_001"}');
    expect(result.statusCode).toBe(500);
  });

  it("should convert null to AccountError", () => {
    const result = handleUnknownError(null);
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBe("null");
  });

  it("should convert undefined to AccountError", () => {
    const result = handleUnknownError(undefined);
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBe("undefined");
  });

  it("should handle circular reference objects gracefully", () => {
    const obj: any = { message: "test" };
    obj.self = obj;
    const result = handleUnknownError(obj);
    expect(result).toBeInstanceOf(AccountError);
    expect(result.message).toBeDefined();
  });
});

describe("Result type", () => {
  it("should represent success result", () => {
    const successResult: Result<string> = { success: true, data: "test" };
    expect(successResult.success).toBe(true);
    expect(successResult.data).toBe("test");
  });

  it("should represent error result", () => {
    const errorResult: Result<string> = {
      success: false,
      error: new AccountError("Error", 400),
    };
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBeInstanceOf(AccountError);
  });

  it("should allow type narrowing based on success", () => {
    const result: Result<number> = { success: true, data: 42 };

    if (result.success) {
      expect(result.data).toBe(42);
      expect(result.data + 8).toBe(50);
    }
  });
});
