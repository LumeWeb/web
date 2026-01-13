import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoUrl, goUrl } from "@/GoUrl";

describe("GoUrl", () => {
  test("renders simple path URL", () => {
    const html = renderToDecodedString(<GoUrl path="/dashboard" />);
    expect(html).toContain('{{"/dashboard"}}');
  });

  test("renders URL with variable", () => {
    const html = renderToDecodedString(<GoUrl var="dashboardUrl" />);
    expect(html).toContain("{{.dashboardUrl}}");
  });

  test("renders URL with query parameters", () => {
    const html = renderToDecodedString(
      <GoUrl path="/verify" params={["token", "email"]} />,
    );
    expect(html).toContain('{{"/verify" | addQueryParams .token .email}}');
  });

  test("renders URL with variable path and parameters", () => {
    const html = renderToDecodedString(
      <GoUrl var="profileUrl" params={["id", "tab"]} />,
    );
    expect(html).toContain("{{.profileUrl | addQueryParams .id .tab}}");
  });

  test("renders URL with literal values", () => {
    const html = renderToDecodedString(
      <GoUrl path="/search" params={["q", "page"]} literalValues={["", "1"]} />,
    );
    expect(html).toContain('{{"/search" | addQueryParams "" "1"}}');
  });

  test("goUrl helper with simple path", () => {
    const result = goUrl("/dashboard");
    expect(result).toBe('{{"/dashboard"}}');
  });

  test("goUrl helper with options object", () => {
    const result = goUrl({ var: "dashboardUrl" });
    expect(result).toBe("{{.dashboardUrl}}");
  });

  test("goUrl helper with params", () => {
    const result = goUrl({ path: "/verify", params: ["token", "email"] });
    expect(result).toBe('{{"/verify" | addQueryParams .token .email}}');
  });
});
