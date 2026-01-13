import { describe, expect, test } from "vitest";
import {
  generateVarSyntax,
  generateIfStart,
  generateElse,
  generateEqualStart,
  generateEmptyStart,
  generateRangeStart,
  generateWithStart,
  generateWithSyntax,
  generateEnd,
  generatePipeSyntax,
  generateLetSyntax,
  generateFormatSyntax,
  generateTruncateSyntax,
  generateDateSyntax,
  generateCurrencySyntax,
  generateFuncSyntax,
  generateUrlSyntax,
  generateTransformSyntax,
  generateChunkSyntax,
  generateDefineStart,
  generateDefineSyntax,
  generateTemplateSyntax,
  generateCommentSyntax,
} from "@/template-generators";

describe("template-generators", () => {
  describe("generateVarSyntax", () => {
    test("generates field access syntax", () => {
      expect(generateVarSyntax("userName")).toBe("{{.userName}}");
      expect(generateVarSyntax("user.name")).toBe("{{.user.name}}");
    });

    test("generates local variable syntax", () => {
      expect(generateVarSyntax("$item")).toBe("{{$item}}");
      expect(generateVarSyntax("$item.name")).toBe("{{$item.name}}");
    });
  });

  describe("generateIfStart", () => {
    test("generates if statement opening syntax", () => {
      expect(generateIfStart("showBanner")).toBe("{{if .showBanner}}");
      expect(generateIfStart("isActive")).toBe("{{if .isActive}}");
    });
  });

  describe("generateElse", () => {
    test("generates else syntax", () => {
      expect(generateElse()).toBe("{{else}}");
    });
  });

  describe("generateEqualStart", () => {
    test("generates equal check with field and literal", () => {
      expect(generateEqualStart("status", '"active"')).toBe(
        '{{if eq .status "active"}}',
      );
    });

    test("generates equal check with two fields", () => {
      expect(generateEqualStart("status", "userStatus")).toBe(
        "{{if eq .status .userStatus}}",
      );
    });

    test("generates equal check with local variable", () => {
      expect(generateEqualStart("$item.type", '"premium"')).toBe(
        '{{if eq $item.type "premium"}}',
      );
    });

    test("generates equal check with number literal", () => {
      expect(generateEqualStart("count", "0")).toBe("{{if eq .count 0}}");
    });
  });

  describe("generateEmptyStart", () => {
    test("generates empty check for field", () => {
      expect(generateEmptyStart("items")).toBe("{{if not .items}}");
      expect(generateEmptyStart("description")).toBe("{{if not .description}}");
    });

    test("generates empty check for local variable", () => {
      expect(generateEmptyStart("$item.description")).toBe(
        "{{if not $item.description}}",
      );
    });
  });

  describe("generateRangeStart", () => {
    test("generates basic range with dot", () => {
      expect(generateRangeStart("items", undefined, undefined)).toBe(
        "{{range .items}}",
      );
    });

    test("generates range with element name", () => {
      expect(generateRangeStart("items", undefined, "item")).toBe(
        "{{range $item := .items}}",
      );
    });

    test("generates range with index and element names", () => {
      expect(generateRangeStart("items", "i", "item")).toBe(
        "{{range $i, $item := .items}}",
      );
    });
  });

  describe("generateWithStart", () => {
    test("generates with statement opening syntax", () => {
      expect(generateWithStart("user")).toBe("{{with .user}}");
      expect(generateWithStart("order")).toBe("{{with .order}}");
    });
  });

  describe("generateWithSyntax", () => {
    test("generates with statement without fallback", () => {
      expect(generateWithSyntax("user", false)).toBe("{{with .user}}{{end}}");
    });

    test("generates with statement with fallback", () => {
      expect(generateWithSyntax("user", true)).toBe(
        "{{with .user}}{{else}}{{end}}",
      );
    });
  });

  describe("generateEnd", () => {
    test("generates end syntax", () => {
      expect(generateEnd()).toBe("{{end}}");
    });
  });

  describe("generatePipeSyntax", () => {
    test("generates single transform pipeline", () => {
      expect(generatePipeSyntax(".text", ["upper"])).toBe("{{.text | upper}}");
    });

    test("generates multiple transform pipeline", () => {
      expect(generatePipeSyntax(".text", ["trim", "upper"])).toBe(
        "{{.text | trim | upper}}",
      );
    });

    test("generates pipeline with local variable", () => {
      expect(generatePipeSyntax("$item.title", ["truncate 50", "upper"])).toBe(
        "{{$item.title | truncate 50 | upper}}",
      );
    });
  });

  describe("generateLetSyntax", () => {
    test("generates simple variable assignment", () => {
      expect(generateLetSyntax("currentUser", ".user")).toBe(
        "{{$currentUser := .user}}",
      );
    });

    test("generates assignment with pipeline", () => {
      expect(
        generateLetSyntax("processedText", ".RawText | truncate 100"),
      ).toBe("{{$processedText := .RawText | truncate 100}}");
    });
  });

  describe("generateFormatSyntax", () => {
    test("generates format without arguments", () => {
      expect(generateFormatSyntax("Hello %s", [])).toBe(
        '{{"Hello %s" | printf}}',
      );
    });

    test("generates format with arguments", () => {
      expect(generateFormatSyntax("%s (%s)", [".name", ".Email"])).toBe(
        '{{"%s (%s)" | printf .name .Email}}',
      );
    });
  });

  describe("generateTruncateSyntax", () => {
    test("generates truncate for field", () => {
      expect(generateTruncateSyntax("description", 100)).toBe(
        "{{.description | truncate 100}}",
      );
    });

    test("generates truncate for local variable", () => {
      expect(generateTruncateSyntax("$item.title", 50)).toBe(
        "{{$item.title | truncate 50}}",
      );
    });
  });

  describe("generateDateSyntax", () => {
    test("generates date formatting syntax", () => {
      expect(generateDateSyntax("createdAt", "Jan 2, 2006")).toBe(
        '{{.createdAt | formatDate "Jan 2, 2006"}}',
      );
    });
  });

  describe("generateCurrencySyntax", () => {
    test("generates currency formatting syntax", () => {
      expect(generateCurrencySyntax("total", "USD")).toBe(
        '{{.total | formatCurrency "USD"}}',
      );
    });
  });

  describe("generateFuncSyntax", () => {
    test("generates function call with arguments", () => {
      expect(
        generateFuncSyntax("pluralize", [".count", '"item"', '"items"']),
      ).toBe('{{pluralize .count "item" "items"}}');
    });

    test("generates function call with single argument", () => {
      expect(generateFuncSyntax("upper", [".text"])).toBe("{{upper .text}}");
    });
  });

  describe("generateUrlSyntax", () => {
    test("generates URL without params", () => {
      expect(generateUrlSyntax('"/dashboard"', [])).toBe('{{"/dashboard"}}');
    });

    test("generates URL with field reference", () => {
      expect(generateUrlSyntax(".dashboardUrl", [])).toBe("{{.dashboardUrl}}");
    });

    test("generates URL with query params", () => {
      expect(generateUrlSyntax('"/verify"', [".Token", ".Email"])).toBe(
        '{{"/verify" | addQueryParams .Token .Email}}',
      );
    });
  });

  describe("generateTransformSyntax", () => {
    test("generates upper transform", () => {
      expect(generateTransformSyntax("name", "upper")).toBe(
        "{{.name | upper}}",
      );
    });

    test("generates lower transform", () => {
      expect(generateTransformSyntax("$item.title", "lower")).toBe(
        "{{$item.title | lower}}",
      );
    });

    test("generates trim transform", () => {
      expect(generateTransformSyntax("text", "trim")).toBe("{{.text | trim}}");
    });
  });

  describe("generateChunkSyntax", () => {
    test("generates chunk without index", () => {
      expect(generateChunkSyntax("items", 3, "chunk", undefined)).toBe(
        "{{$chunk := chunk .items 3}}",
      );
    });

    test("generates chunk with index", () => {
      expect(generateChunkSyntax("items", 3, "chunk", "chunkIndex")).toBe(
        "{{$chunkIndex, $chunk := chunk .items 3}}",
      );
    });
  });

  describe("generateDefineStart", () => {
    test("generates define opening syntax", () => {
      expect(generateDefineStart("email-header")).toBe(
        '{{define "email-header"}}',
      );
    });
  });

  describe("generateDefineSyntax", () => {
    test("generates define syntax", () => {
      expect(generateDefineSyntax("email-header")).toBe(
        '{{define "email-header"}}{{end}}',
      );
    });
  });

  describe("generateTemplateSyntax", () => {
    test("generates template invocation without data", () => {
      expect(generateTemplateSyntax("email-header", undefined)).toBe(
        '{{template "email-header"}}',
      );
    });

    test("generates template invocation with data", () => {
      expect(generateTemplateSyntax("user-info", "currentUser")).toBe(
        '{{template "user-info" .currentUser}}',
      );
    });
  });

  describe("generateCommentSyntax", () => {
    test("generates comment syntax", () => {
      expect(generateCommentSyntax("This is a comment")).toBe(
        "{{/* This is a comment */}}",
      );
    });
  });
});
