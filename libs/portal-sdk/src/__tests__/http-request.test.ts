import { describe, expect, it } from "vitest";

import {
  buildApiUrl,
  buildJsonOptions,
  parseRawJson,
  parseRawJsonOrNull,
  toAccountError,
} from "@/http/request";

function textResponse(body: string, status = 200): Response {
  return { status, text: async () => body } as unknown as Response;
}

describe("buildApiUrl", () => {
  it("joins a relative path against the API base", () => {
    expect(buildApiUrl("/api/auth/key/verify", "https://account.lumeweb.test/")).toBe(
      "https://account.lumeweb.test/api/auth/key/verify",
    );
  });

  it("uses an absolute input as-is", () => {
    expect(buildApiUrl("https://other.test/x", "https://account.lumeweb.test")).toBe(
      "https://other.test/x",
    );
  });
});

describe("buildJsonOptions", () => {
  it("returns same-origin relative paths", () => {
    const options = buildJsonOptions({ method: "POST" }, undefined, "same-origin");
    expect(options.credentials).toBe("same-origin");
  });

  it("attaches the Bearer header only when a token is present", () => {
    const noToken = buildJsonOptions({}, undefined, "include");
    expect(noToken.headers?.["Authorization"]).toBeUndefined();

    const withToken = buildJsonOptions({}, "jwt-1", "include");
    expect(withToken.headers?.["Authorization"]).toBe("Bearer jwt-1");
    expect(withToken.credentials).toBe("include");
  });

  it("lets init headers override the defaults", () => {
    const options = buildJsonOptions(
      { headers: { Authorization: "Bearer raw", "X-Custom": "1" } },
      "jwt-1",
      "include",
    );
    expect(options.headers?.["Authorization"]).toBe("Bearer raw");
    expect(options.headers?.["X-Custom"]).toBe("1");
    expect(options.headers?.["Content-Type"]).toBe("application/json");
  });

  it("preserves other RequestInit fields", () => {
    const options = buildJsonOptions({ body: "{}", method: "POST" }, undefined, "include");
    expect(options.body).toBe("{}");
    expect(options.method).toBe("POST");
  });
});

describe("parseRawJson", () => {
  it("parses an empty body as {}", async () => {
    await expect(parseRawJson(textResponse(""))).resolves.toEqual({});
  });

  it("throws SyntaxError on a non-JSON body", async () => {
    await expect(parseRawJson(textResponse("<html>"))).rejects.toThrow(SyntaxError);
  });

  it("parses a JSON body", async () => {
    await expect(parseRawJson(textResponse('{"a":1}'))).resolves.toEqual({ a: 1 });
  });
});

describe("parseRawJsonOrNull", () => {
  it("parses an empty body as {}", async () => {
    await expect(parseRawJsonOrNull(textResponse(""))).resolves.toEqual({});
  });

  it("maps a non-JSON body to null", async () => {
    await expect(parseRawJsonOrNull(textResponse("<!DOCTYPE html>"))).resolves.toBeNull();
  });

  it("parses a JSON body", async () => {
    await expect(parseRawJsonOrNull(textResponse('{"otp":true}'))).resolves.toEqual({
      otp: true,
    });
  });
});

describe("toAccountError", () => {
  it("maps a thrown Response through the fetch-error mapping", async () => {
    const err = await toAccountError(
      new Response(JSON.stringify({ error: { reason: "Nope" } }), {
        headers: { "content-type": "application/json" },
        status: 403,
      }),
    );
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Nope");
  });

  it("maps a thrown Error to a 500 AccountError", async () => {
    const err = await toAccountError(new TypeError("Failed to fetch"));
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Failed to fetch");
  });
});
