import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoEqual } from "@/GoEqual";
import { GoElse } from "@/GoIf";

describe("GoEqual", () => {
  test("renders equal check without else", () => {
    const html = renderToDecodedString(
      <GoEqual var1="status" var2='"active"'>
        <div>Status is active</div>
      </GoEqual>,
    );
    expect(html).toContain('{{if eq .status "active"}}');
    expect(html).toContain("<div>Status is active</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders equal check with else", () => {
    const html = renderToDecodedString(
      <GoEqual var1="status" var2='"active"'>
        <div>Status is active</div>
        <GoElse>
          <div>Status is not active</div>
        </GoElse>
      </GoEqual>,
    );
    expect(html).toContain('{{if eq .status "active"}}');
    expect(html).toContain("<div>Status is active</div>");
    expect(html).toContain("{{else}}");
    expect(html).toContain("<div>Status is not active</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders equal check with two variables", () => {
    const html = renderToDecodedString(
      <GoEqual var1="count" var2="maxCount">
        <div>Reached maximum</div>
      </GoEqual>,
    );
    expect(html).toContain("{{if eq .count .maxCount}}");
    expect(html).toContain("<div>Reached maximum</div>");
    expect(html).toContain("{{end}}");
  });
});
