import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoEmpty } from "@/GoEmpty";
import { GoElse } from "@/GoIf";

describe("GoEmpty", () => {
  test("renders empty check without else", () => {
    const html = renderToDecodedString(
      <GoEmpty var="items">
        <div>No items found</div>
      </GoEmpty>,
    );
    expect(html).toContain("{{if not .items}}");
    expect(html).toContain("<div>No items found</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders empty check with else", () => {
    const html = renderToDecodedString(
      <GoEmpty var="items">
        <div>No items found</div>
        <GoElse>
          <div>Items exist</div>
        </GoElse>
      </GoEmpty>,
    );
    expect(html).toContain("{{if not .items}}");
    expect(html).toContain("<div>No items found</div>");
    expect(html).toContain("{{else}}");
    expect(html).toContain("<div>Items exist</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders empty check with local variable", () => {
    const html = renderToDecodedString(
      <GoEmpty var="$item.description">
        <div>No description</div>
      </GoEmpty>,
    );
    expect(html).toContain("{{if not $item.description}}");
    expect(html).toContain("<div>No description</div>");
    expect(html).toContain("{{end}}");
  });
});
