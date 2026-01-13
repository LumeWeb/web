import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoFormat } from "@/GoFormat";
import { GoVar } from "@/GoVar";

describe("GoFormat", () => {
  test("renders format with two variables", () => {
    const html = renderToDecodedString(
      <GoFormat format="%s (%s)">
        <GoVar name="name" />
        <GoVar name="email" />
      </GoFormat>,
    );
    expect(html).toContain('{{"%s (%s)" | printf .name .email}}');
  });

  test("renders format with local variables", () => {
    const html = renderToDecodedString(
      <GoFormat format="Item #%d: %s">
        <GoVar name="$item.id" />
        <GoVar name="$item.name" />
      </GoFormat>,
    );
    expect(html).toContain('{{"Item #%d: %s" | printf $item.id $item.name}}');
  });

  test("renders format without arguments", () => {
    const html = renderToDecodedString(<GoFormat format="Hello %s" />);
    expect(html).toContain('{{"Hello %s" | printf}}');
  });
});
