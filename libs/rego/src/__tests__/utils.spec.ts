import { describe, expect, test } from "vitest";
import { normalizeVarName } from "@/utils";

describe("utils", () => {
  describe("normalizeVarName", () => {
    test("prefixes field variables with dot", () => {
      expect(normalizeVarName("userName")).toBe(".userName");
      expect(normalizeVarName("user.name")).toBe(".user.name");
      expect(normalizeVarName("items")).toBe(".items");
    });

    test("preserves local variable syntax", () => {
      expect(normalizeVarName("$item")).toBe("$item");
      expect(normalizeVarName("$item.Name")).toBe("$item.Name");
      expect(normalizeVarName("$idx")).toBe("$idx");
    });
  });
});
