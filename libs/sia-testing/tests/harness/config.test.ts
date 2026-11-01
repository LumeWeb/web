import { describe, expect, it } from "vitest";
import {
  readHostServiceConfig,
  redactSensitive,
} from "../../src/e2e/internal/config.js";

describe("real-service configuration", () => {
  const local = {
    SIA_TEST_ADMIN_PASSWORD: "admin-secret",
    SIA_TEST_ADMIN_URL: "http://localhost:4001",
    SIA_TEST_ALLOW_MUTATION: "1",
    SIA_TEST_INDEXD_URL: "http://127.0.0.1:4000",
  };

  it("requires mutation consent before local admin provisioning", () => {
    expect(() =>
      readHostServiceConfig({ ...local, SIA_TEST_ALLOW_MUTATION: "0" }),
    ).toThrow("SIA_TEST_ALLOW_MUTATION");
    expect(readHostServiceConfig(local)).toMatchObject({
      indexdURL: new URL("http://127.0.0.1:4000"),
      password: "admin-secret",
    });
  });

  it("keeps browser certificate exceptions restricted to local endpoints", () => {
    expect(() =>
      readHostServiceConfig({
        ...local,
        SIA_TEST_INDEXD_URL: "https://remote.example.test",
      }),
    ).toThrow("loopback");
    expect(() =>
      readHostServiceConfig({
        ...local,
        SIA_TEST_ADMIN_URL: "http://user:secret@localhost",
      }),
    ).toThrow("credentials");
    expect(() =>
      readHostServiceConfig({
        ...local,
        SIA_TEST_INDEXD_URL: "file:///tmp/indexd",
      }),
    ).toThrow("HTTP");
  });

  it("redacts credentials in URLs and diagnostics", () => {
    const output = redactSensitive(
      "https://u:password@indexd.test/path?token=secret&password=also-secret",
    );
    expect(output).not.toMatch(/secret|also-secret/);
    expect(output).toContain("REDACTED");
  });

  it.each([
    "object:created: token=private-value",
    "password: private-value",
    "Authorization: Basic private-value",
    "Authorization: Bearer private-value",
    '{"password":"private-value"}',
  ])("redacts credentials from diagnostic text %s", (diagnostic) => {
    const output = redactSensitive(diagnostic);
    expect(output).not.toContain("private-value");
    expect(output).toContain("REDACTED");
  });
});
