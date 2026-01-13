import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoIf, GoElse } from "@/GoIf";

describe("GoIf", () => {
  test("renders if statement without else", () => {
    const html = renderToDecodedString(
      <GoIf condition="showBanner">
        <div>Banner content</div>
      </GoIf>,
    );
    expect(html).toContain("{{if .showBanner}}");
    expect(html).toContain("<div>Banner content</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders if statement with else", () => {
    const html = renderToDecodedString(
      <GoIf condition="isLoggedIn">
        <div>Welcome back!</div>
        <GoElse>
          <div>Please log in</div>
        </GoElse>
      </GoIf>,
    );
    expect(html).toContain("{{if .isLoggedIn}}");
    expect(html).toContain("<div>Welcome back!</div>");
    expect(html).toContain("{{else}}");
    expect(html).toContain("<div>Please log in</div>");
    expect(html).toContain("{{end}}");
  });

  test("handles nested GoElse correctly", () => {
    const html = renderToDecodedString(
      <GoIf condition="isActive">
        <span>Active</span>
        <GoElse>
          <span>Inactive</span>
        </GoElse>
      </GoIf>,
    );
    expect(html).toMatch(
      /{{if \.isActive}}<span>Active<\/span>{{else}}<span>Inactive<\/span>{{end}}/,
    );
  });
});
