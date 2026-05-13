import { describe, it, expect } from "vitest";
import { formatAmount, formatNumber } from "@/utils/formatAmount";

describe("formatAmount", () => {
  it("formats numbers as currency in USD by default", () => {
    expect(formatAmount(42.5)).toBe("$42.50");
    expect(formatAmount(100)).toBe("$100.00");
    expect(formatAmount(0)).toBe("$0.00");
  });

  it("accepts string values", () => {
    expect(formatAmount("99.99")).toBe("$99.99");
    expect(formatAmount("0")).toBe("$0.00");
  });

  it("handles different currencies", () => {
    expect(formatAmount(42.5, { currency: "EUR" })).toBe("€42.50");
    expect(formatAmount(42.5, { currency: "GBP" })).toBe("£42.50");
  });

  it("handles different locales", () => {
    const result = formatAmount(1234.56, { locale: "de-DE", currency: "EUR" });
    // German format uses non-breaking space before currency symbol
    expect(result).toMatch(/1\.234,56.€/);
  });

  it("handles zero-decimal currencies (JPY, KRW, VND, etc.)", () => {
    // JPY, KRW, VND have 0 decimal places
    expect(formatAmount(1234, { currency: "JPY" })).toMatch(/¥1,234/);
    expect(formatAmount(50000, { currency: "KRW" })).toMatch(/₩50,000/);
    expect(formatAmount(100000, { currency: "VND" })).toMatch(/₫100,000/);
    expect(formatAmount(999, { currency: "CLP" })).toMatch(/CLP.?999/);
  });

  it("handles three-decimal currencies (KWD, BHD, OMR, etc.)", () => {
    // Kuwaiti Dinar, Bahraini Dinar, Omani Rial have 3 decimal places
    expect(formatAmount(1.5, { currency: "KWD" })).toMatch(/KWD.?1\.500/);
    expect(formatAmount(0.75, { currency: "BHD" })).toMatch(/BHD.?0\.750/);
    expect(formatAmount(10.123, { currency: "OMR" })).toMatch(/OMR.?10\.123/);
    expect(formatAmount(5.5, { currency: "JOD" })).toMatch(/JOD.?5\.500/);
    expect(formatAmount(3.125, { currency: "TND" })).toMatch(/TND.?3\.125/);
  });

  it("handles NaN values", () => {
    expect(formatAmount("not-a-number")).toBe("—");
    expect(formatAmount(NaN)).toBe("—");
  });

  it("rounds to 2 decimal places by default", () => {
    expect(formatAmount(42.555)).toBe("$42.56");
    expect(formatAmount(42.5)).toBe("$42.50");
  });
});

describe("formatNumber", () => {
  it("formats plain numbers without currency", () => {
    expect(formatNumber(1234.56)).toBe("1,234.56");
    expect(formatNumber(42)).toBe("42");
  });

  it("accepts string values", () => {
    expect(formatNumber("99.99")).toBe("99.99");
  });

  it("handles NaN values", () => {
    expect(formatNumber("invalid")).toBe("—");
    expect(formatNumber(NaN)).toBe("—");
  });

  it("respects maximum fraction digits", () => {
    expect(formatNumber(1234.5678, { maximumFractionDigits: 2 })).toBe("1,234.57");
    expect(formatNumber(1234.5678, { maximumFractionDigits: 4 })).toBe("1,234.5678");
  });

  it("handles different locales", () => {
    expect(formatNumber(1234.56, { locale: "de-DE" })).toBe("1.234,56");
  });
});
