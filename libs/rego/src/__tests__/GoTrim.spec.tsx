import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoTrim } from "@/GoTrim";
import { GoVar } from "@/GoVar";

describe("GoTrim", () => {
  test("renders trim transform for field", () => {
    const html = renderToDecodedString(
      <GoTrim>
        <GoVar name="name" />
      </GoTrim>,
    );
    expect(html).toContain("{{.name | trim}}");
  });

  test("renders trim transform for local variable", () => {
    const html = renderToDecodedString(
      <GoTrim>
        <GoVar name="$item.title" />
      </GoTrim>,
    );
    expect(html).toContain("{{$item.title | trim}}");
  });

  test("renders null when children is not GoVar", () => {
    const html = renderToDecodedString(
      <GoTrim>
        <div>Not a GoVar</div>
      </GoTrim>,
    );
    expect(html).toBe("");
  });
});
