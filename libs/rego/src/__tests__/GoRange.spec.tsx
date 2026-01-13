import { describe, expect, test } from "vitest";
import { renderToDecodedString, stripReactComments } from "./testHelpers";
import { GoRange } from "@/GoRange";
import { GoVar } from "@/GoVar";

describe("GoRange", () => {
  test("renders basic range with dot syntax", () => {
    const html = stripReactComments(
      renderToDecodedString(
        <GoRange items="cartItems">
          <div>
            Item: <GoVar name="name" />
          </div>
        </GoRange>,
      ),
    );
    expect(html).toContain("{{range .cartItems}}");
    expect(html).toContain("<div>Item: {{.name}}</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders range with element name", async () => {
    const html = renderToDecodedString(
      <GoRange items="items" elementName="item">
        <div>
          <GoVar name="$item.name" />
        </div>
      </GoRange>,
    );
    expect(html).toContain("{{range $item := .items}}");
    expect(html).toContain("{{$item.name}}");
    expect(html).toContain("{{end}}");
  });

  test("renders range with index and element names", () => {
    const html = renderToDecodedString(
      <GoRange items="items" indexName="i" elementName="item">
        <div>
          <GoVar name="$i" />: <GoVar name="$item.name" />
        </div>
      </GoRange>,
    );
    expect(html).toContain("{{range $i, $item := .items}}");
    expect(html).toContain("{{$i}}");
    expect(html).toContain("{{$item.name}}");
    expect(html).toContain("{{end}}");
  });

  test("renders range with empty fallback", () => {
    const html = renderToDecodedString(
      <GoRange items="items" empty={<div>No items</div>}>
        <div>
          <GoVar name="Name" />
        </div>
      </GoRange>,
    );
    expect(html).toContain("{{range .items}}");
    expect(html).toContain("{{else}}");
    expect(html).toContain("<div>No items</div>");
    expect(html).toContain("{{end}}");
  });
});
