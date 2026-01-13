import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoFunc, goFunc } from "@/GoFunc";

describe("GoFunc", () => {
  test("renders function call with var and args", () => {
    const html = renderToDecodedString(
      <GoFunc name="pluralize" var="itemCount" args={["item", "items"]} />,
    );
    expect(html).toContain('{{pluralize .itemCount "item" "items"}}');
  });

  test("renders function call with vars", () => {
    const html = renderToDecodedString(
      <GoFunc name="formatFullName" vars={["firstName", "lastName"]} />,
    );
    expect(html).toContain("{{formatFullName .firstName .lastName}}");
  });

  test("renders function call with number argument", () => {
    const html = renderToDecodedString(
      <GoFunc name="repeat" var="text" args={[3]} />,
    );
    expect(html).toContain("{{repeat .text 3}}");
  });

  test("renders function call with local variable", () => {
    const html = renderToDecodedString(
      <GoFunc name="formatPrice" var="$item.price" args={["USD"]} />,
    );
    expect(html).toContain('{{formatPrice $item.price "USD"}}');
  });

  test("goFunc helper function returns correct syntax", () => {
    const result = goFunc("pluralize", {
      var: "itemCount",
      args: ["item", "items"],
    });
    expect(result).toBe('{{pluralize .itemCount "item" "items"}}');
  });

  test("goFunc helper with vars", () => {
    const result = goFunc("formatFullName", {
      vars: ["firstName", "lastName"],
    });
    expect(result).toBe("{{formatFullName .firstName .lastName}}");
  });
});
