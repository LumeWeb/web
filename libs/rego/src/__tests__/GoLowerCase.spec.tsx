import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoLowerCase } from "@/GoLowerCase";
import { GoVar } from "@/GoVar";

describe("GoLowerCase", () => {
  test("renders lowercase transform for field", () => {
    const html = renderToDecodedString(
      <GoLowerCase>
        <GoVar name="name" />
      </GoLowerCase>,
    );
    expect(html).toContain("{{.name | lower}}");
  });

  test("renders lowercase transform for local variable", () => {
    const html = renderToDecodedString(
      <GoLowerCase>
        <GoVar name="$item.title" />
      </GoLowerCase>,
    );
    expect(html).toContain("{{$item.title | lower}}");
  });

  test("renders null when children is not GoVar", () => {
    const html = renderToDecodedString(
      <GoLowerCase>
        <div>Not a GoVar</div>
      </GoLowerCase>,
    );
    expect(html).toBe("");
  });
});
