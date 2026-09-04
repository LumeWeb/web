import { describe, expect, it } from "vitest";

import { resolveLoginErrorNotice } from "./loginErrorNotice";

describe("resolveLoginErrorNotice", () => {
  it("returns null when there is no ?error= param", () => {
    expect(resolveLoginErrorNotice(null, null)).toBeNull();
  });

  it("ignores unknown error values (no arbitrary copy injection)", () => {
    expect(resolveLoginErrorNotice("unknown_failure", null)).toBeNull();
    expect(resolveLoginErrorNotice("EMAIL_TAKEN", null)).toBeNull();
    expect(resolveLoginErrorNotice("email_taken;x", null)).toBeNull();
  });

  it("renders the email_taken copy with the generic provider label", () => {
    expect(resolveLoginErrorNotice("email_taken", null)).toBe(
      "An account with this email already exists — sign in with email, then connect your provider in Settings.",
    );
  });

  it("uses a sanitized provider slug when one is present", () => {
    expect(resolveLoginErrorNotice("email_taken", "google")).toBe(
      "An account with this email already exists — sign in with email, then connect Google in Settings.",
    );
  });

  it("falls back to the generic label for hostile provider values", () => {
    expect(
      resolveLoginErrorNotice("email_taken", "<script>alert(1)</script>"),
    ).toBe(
      "An account with this email already exists — sign in with email, then connect your provider in Settings.",
    );
    expect(resolveLoginErrorNotice("email_taken", "9 Mile; drop table")).toBe(
      "An account with this email already exists — sign in with email, then connect your provider in Settings.",
    );
  });
});
