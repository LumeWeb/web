import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoCurrency, goCurrency } from "@/GoCurrency";

describe("GoCurrency", () => {
  test("renders currency formatting with field", () => {
    const html = renderToDecodedString(
      <GoCurrency var="total" currency="USD" />,
    );
    expect(html).toContain('{{.total | formatCurrency "USD"}}');
  });

  test("renders currency formatting with local variable", () => {
    const html = renderToDecodedString(
      <GoCurrency var="$item.price" currency="EUR" />,
    );
    expect(html).toContain('{{$item.price | formatCurrency "EUR"}}');
  });

  test("goCurrency helper function returns correct syntax", () => {
    const result = goCurrency("total", "USD");
    expect(result).toBe('{{.total | formatCurrency "USD"}}');
  });
});
