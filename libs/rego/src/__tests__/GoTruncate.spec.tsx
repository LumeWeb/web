import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoTruncate } from "@/GoTruncate";

describe("GoTruncate", () => {
  test("renders truncate for field", () => {
    const html = renderToDecodedString(
      <GoTruncate var="description" length={100} />,
    );
    expect(html).toContain("{{.description | truncate 100}}");
  });

  test("renders truncate for local variable", () => {
    const html = renderToDecodedString(
      <GoTruncate var="$item.description" length={50} />,
    );
    expect(html).toContain("{{$item.description | truncate 50}}");
  });
});
