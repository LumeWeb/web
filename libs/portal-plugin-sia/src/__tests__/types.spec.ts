import { describe, expect, it } from "vitest";

import type { AppResponse } from "../types";

describe("AppResponse type", () => {
  it("accepts a valid AppResponse object", () => {
    const app: AppResponse = {
      publicKey: "0xabc123",
      name: "TestApp",
      description: "A test application",
      logoURL: "https://example.com/logo.png",
      serviceURL: "https://example.com",
      pinnedData: 1048576,
      lastUsed: "2026-06-22T00:00:00Z",
    };

    expect(app.publicKey).toBe("0xabc123");
    expect(app.name).toBe("TestApp");
    expect(app.pinnedData).toBe(1048576);
  });

  it("accepts empty string values for optional-like fields", () => {
    const app: AppResponse = {
      publicKey: "",
      name: "",
      description: "",
      logoURL: "",
      serviceURL: "",
      pinnedData: 0,
      lastUsed: "",
    };

    expect(app.publicKey).toBe("");
    expect(app.pinnedData).toBe(0);
  });
});
