import { describe, expect, it } from "vitest";
import { CsvFormatter } from "../csv-formatter";
import type { CsvFormatterOptions, HeadersConfig } from "../csv-options";

export const objectRows = [
  { a: "a1", b: "b1" },
  { a: "a2", b: "b2" },
];

export const arrayRows = [
  ["a", "b"],
  ["a1", "b1"],
  ["a2", "b2"],
];

export const multiDimensionalRows = [
  [
    ["a", "a1"],
    ["b", "b1"],
  ],
  [
    ["a", "a2"],
    ["b", "b2"],
  ],
];

describe("CsvFormatter", () => {
  describe("#format", () => {
    it("should write an array of arrays", () => {
      const formatter = new CsvFormatter({ headers: true as HeadersConfig });
      expect(formatter.format(arrayRows)).toBe("a,b\na1,b1\na2,b2");
    });

    it("should support transforming an array of arrays", () => {
      const formatter = new CsvFormatter({
        headers: true as HeadersConfig,
        transform: (row) => (row as string[]).map((entry) => entry.toUpperCase()),
      });
      expect(formatter.format(arrayRows)).toBe("A,B\nA1,B1\nA2,B2");
    });

    it("should write an array of multi-dimensional arrays", () => {
      const formatter = new CsvFormatter({ headers: true as HeadersConfig });
      expect(formatter.format(multiDimensionalRows)).toBe("a,b\na1,b1\na2,b2");
    });

    it("should support transforming an array of multi-dimensional arrays", () => {
      const formatter = new CsvFormatter({
        headers: true as HeadersConfig,
        transform: (row) =>
          (row as string[][]).map((col) => [col[0], col[1].toUpperCase()]),
      });
      expect(formatter.format(multiDimensionalRows)).toBe("a,b\nA1,B1\nA2,B2");
    });

    it("should write an array of objects", () => {
      const formatter = new CsvFormatter({
        headers: true as HeadersConfig,
        transform: (row) => ({
          A: (row as Record<string, string>).a,
          B: (row as Record<string, string>).b,
        }),
      });
      expect(formatter.format(objectRows)).toBe("A,B\na1,b1\na2,b2");
    });

    describe("header option", () => {
      it("should write an array of objects without headers", () => {
        const formatter = new CsvFormatter({ headers: false });
        expect(formatter.format(objectRows)).toBe("a1,b1\na2,b2");
      });

      it("should write an array of objects with headers", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig });
        expect(formatter.format(objectRows)).toBe("a,b\na1,b1\na2,b2");
      });

      it("should write an array of arrays without headers", () => {
        const rows = [
          ["a1", "b1"],
          ["a2", "b2"],
        ];
        const formatter = new CsvFormatter({ headers: false });
        expect(formatter.format(rows)).toBe("a1,b1\na2,b2");
      });

      it("should write an array of arrays with headers", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig });
        expect(formatter.format(arrayRows)).toBe("a,b\na1,b1\na2,b2");
      });

      it("should write an array of multi-dimensional arrays without headers", () => {
        const formatter = new CsvFormatter({ headers: false });
        expect(formatter.format(multiDimensionalRows)).toBe("a1,b1\na2,b2");
      });

      it("should write an array of multi-dimensional arrays with headers", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig });
        expect(formatter.format(multiDimensionalRows)).toBe("a,b\na1,b1\na2,b2");
      });
    });

    describe("rowDelimiter option", () => {
      it("should support specifying an alternate row delimiter", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, rowDelimiter: "\r\n" });
        expect(formatter.format(objectRows)).toBe("a,b\r\na1,b1\r\na2,b2");
      });

      it("should escape values that contain the alternate row delimiter", () => {
        const rows = [
          { a: "a\t1", b: "b1" },
          { a: "a\t2", b: "b2" },
        ];
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, rowDelimiter: "\t" });
        expect(formatter.format(rows)).toBe('a,b\t"a\t1",b1\t"a\t2",b2');
      });
    });

    describe("includeEndRowDelimiter option", () => {
      it("should add a final rowDelimiter if includeEndRowDelimiter is true", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, includeEndRowDelimiter: true });
        expect(formatter.format(objectRows)).toBe("a,b\na1,b1\na2,b2\n");
      });
    });

    describe("writeBOM option", () => {
      it("should write BOM at the beginning if writeBOM is true", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, writeBOM: true });
        expect(formatter.format(objectRows)).toBe("\ufeffa,b\na1,b1\na2,b2");
      });

      it("should not write BOM if writeBOM is false", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, writeBOM: false });
        expect(formatter.format(objectRows)).toBe("a,b\na1,b1\na2,b2");
      });
    });

    describe("alwaysWriteHeaders option", () => {
      it("should write headers even if no rows were written", () => {
        const formatter = new CsvFormatter({ headers: ["h1", "h2"], alwaysWriteHeaders: true });
        expect(formatter.format([])).toBe("h1,h2");
      });

      it("should not write headers twice if rows were written", () => {
        const formatter = new CsvFormatter({ headers: ["h1", "h2"], alwaysWriteHeaders: true });
        expect(formatter.format([{ h1: "v1", h2: "v2" }])).toBe("h1,h2\nv1,v2");
      });
    });

    describe("delimiter option", () => {
      it("should support specifying an alternate delimiter", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, delimiter: ";" });
        expect(formatter.format(objectRows)).toBe("a;b\na1;b1\na2;b2");
      });
    });

    describe("quote option", () => {
      it("should support specifying an alternate quote character", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quote: "$" });
        expect(formatter.format([{ a: 'a"1', b: "b1" }])).toBe('a,b\n$a""1$,b1');
      });

      it("should disable quoting if quote is false", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quote: false });
        expect(formatter.format([{ a: "a,1", b: "b1" }])).toBe("a,b\na,1,b1");
      });
    });

    describe("quoteColumns option", () => {
      it("should quote all columns if quoteColumns is true", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quoteColumns: true });
        expect(formatter.format(objectRows)).toBe('"a","b"\n"a1","b1"\n"a2","b2"');
      });

      it("should quote specific columns if quoteColumns is an array", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quoteColumns: [true, false] });
        expect(formatter.format(objectRows)).toBe('"a",b\n"a1",b1\n"a2",b2');
      });

      it("should quote specific columns if quoteColumns is an object", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quoteColumns: { a: true, b: false } });
        expect(formatter.format(objectRows)).toBe('"a",b\n"a1",b1\n"a2",b2');
      });
    });

    describe("quoteHeaders option", () => {
      it("should quote all headers if quoteHeaders is true", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quoteHeaders: true });
        expect(formatter.format(objectRows)).toBe('"a","b"\na1,b1\na2,b2');
      });

      it("should quote specific headers if quoteHeaders is an array", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quoteHeaders: [true, false] });
        expect(formatter.format(objectRows)).toBe('"a",b\na1,b1\na2,b2');
      });

      it("should quote specific headers if quoteHeaders is an object", () => {
        const formatter = new CsvFormatter({ headers: true as HeadersConfig, quoteHeaders: { a: true, b: false } });
        expect(formatter.format(objectRows)).toBe('"a",b\na1,b1\na2,b2');
      });
    });
  });

  describe("#formatRow", () => {
    it("should format a single row", () => {
      const formatter = new CsvFormatter({ headers: true as HeadersConfig });
      expect(formatter.formatRow({ a: "a1", b: "b1" })).toBe("a,b\na1,b1");
    });

    it("should not write headers again on subsequent rows", () => {
      const formatter = new CsvFormatter({ headers: true as HeadersConfig });
      formatter.formatRow({ a: "a1", b: "b1" });
      expect(formatter.formatRow({ a: "a2", b: "b2" })).toBe("\na2,b2");
    });
  });
});
