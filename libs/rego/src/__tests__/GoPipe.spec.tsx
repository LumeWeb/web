import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoPipe } from "@/GoPipe";
import { GoVar } from "@/GoVar";

describe("GoPipe", () => {
  test("renders pipeline with single transform", () => {
    const html = renderToDecodedString(
      <GoPipe>
        <GoVar name="description" />
      </GoPipe>,
    );
    expect(html).toContain("{{.description}}");
  });

  test("renders pipeline with GoVar only", () => {
    const html = renderToDecodedString(
      <GoPipe>
        <GoVar name="description" />
      </GoPipe>,
    );
    expect(html).toContain("{{.description}}");
  });

  test("renders null when no children", () => {
    const html = renderToDecodedString(<GoPipe />);
    expect(html).toBe("");
  });

  test("renders null when first child is not GoVar or GoFormat", () => {
    const html = renderToDecodedString(
      <GoPipe>
        <div>Not a GoVar</div>
      </GoPipe>,
    );
    expect(html).toBe("");
  });
});
