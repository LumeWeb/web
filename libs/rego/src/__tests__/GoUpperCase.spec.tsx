import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoUpperCase } from "@/GoUpperCase";
import { GoVar } from "@/GoVar";

describe("GoUpperCase", () => {
  test("renders uppercase transform for field", () => {
    const html = renderToDecodedString(
      <GoUpperCase>
        <GoVar name="name" />
      </GoUpperCase>,
    );
    expect(html).toContain("{{.name | upper}}");
  });

  test("renders uppercase transform for local variable", () => {
    const html = renderToDecodedString(
      <GoUpperCase>
        <GoVar name="$item.title" />
      </GoUpperCase>,
    );
    expect(html).toContain("{{$item.title | upper}}");
  });

  test("renders null when children is not GoVar", () => {
    const html = renderToDecodedString(
      <GoUpperCase>
        <div>Not a GoVar</div>
      </GoUpperCase>,
    );
    expect(html).toBe("");
  });
});
