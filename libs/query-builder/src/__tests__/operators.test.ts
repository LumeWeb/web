import { describe, expect, test } from "vitest";

import {
  COMPARISON_OPERATORS,
  isArrayOperator,
  LOGICAL_OPERATORS,
  mapOperator,
  mapOperatorFromParam,
} from "../operators.js";

describe("operators", () => {
  describe("mapOperator", () => {
    test("maps eq to empty string", () => {
      expect(mapOperator("eq")).toBe("");
    });

    test("maps ne to ne", () => {
      expect(mapOperator("ne")).toBe(COMPARISON_OPERATORS.NE);
    });

    test("maps contains to contains", () => {
      expect(mapOperator("contains")).toBe(COMPARISON_OPERATORS.CONTAINS);
    });

    test("maps between to between", () => {
      expect(mapOperator("between")).toBe(COMPARISON_OPERATORS.BETWEEN);
    });

    test("maps null to null", () => {
      expect(mapOperator("null")).toBe(COMPARISON_OPERATORS.NULL);
    });

    test("maps nnull to nnull", () => {
      expect(mapOperator("nnull")).toBe(COMPARISON_OPERATORS.NNULL);
    });

    test("throws error for unsupported operator", () => {
      expect(() => mapOperator("invalid" as any)).toThrow(
        "Unsupported operator: invalid",
      );
    });
  });

  describe("mapOperatorFromParam", () => {
    test("maps empty string to eq", () => {
      expect(mapOperatorFromParam("")).toBe(COMPARISON_OPERATORS.EQ);
    });

    test("maps eq to eq", () => {
      expect(mapOperatorFromParam("eq")).toBe(COMPARISON_OPERATORS.EQ);
    });

    test("maps neq to ne", () => {
      expect(mapOperatorFromParam("neq")).toBe(COMPARISON_OPERATORS.NE);
    });

    test("maps contains to contains", () => {
      expect(mapOperatorFromParam("contains")).toBe(
        COMPARISON_OPERATORS.CONTAINS,
      );
    });

    test("maps startswiths to startswiths", () => {
      expect(mapOperatorFromParam("startswiths")).toBe(
        COMPARISON_OPERATORS.STARTSWITHS,
      );
    });

    test("maps null to null", () => {
      expect(mapOperatorFromParam("null")).toBe(COMPARISON_OPERATORS.NULL);
    });

    test("maps nnull to nnull", () => {
      expect(mapOperatorFromParam("nnull")).toBe(COMPARISON_OPERATORS.NNULL);
    });

    test("throws error for unsupported operator", () => {
      expect(() => mapOperatorFromParam("invalid")).toThrow(
        "Unsupported operator parameter: invalid",
      );
    });
  });

  describe("isArrayOperator", () => {
    test("returns true for in operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.IN)).toBe(true);
    });

    test("returns true for nin operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.NIN)).toBe(true);
    });

    test("returns true for ina operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.INA)).toBe(true);
    });

    test("returns true for nina operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.NINA)).toBe(true);
    });

    test("returns true for between operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.BETWEEN)).toBe(true);
    });

    test("returns true for nbetween operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.NBETWEEN)).toBe(true);
    });

    test("returns false for eq operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.EQ)).toBe(false);
    });

    test("returns false for contains operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.CONTAINS)).toBe(false);
    });

    test("returns false for null operator", () => {
      expect(isArrayOperator(COMPARISON_OPERATORS.NULL)).toBe(false);
    });
  });

  describe("LOGICAL_OPERATORS", () => {
    test("has correct values", () => {
      expect(LOGICAL_OPERATORS.AND).toBe("and");
      expect(LOGICAL_OPERATORS.OR).toBe("or");
      expect(LOGICAL_OPERATORS.NOT).toBe("not");
    });
  });

  describe("COMPARISON_OPERATORS", () => {
    test("has eq operator", () => {
      expect(COMPARISON_OPERATORS.EQ).toBe("eq");
    });

    test("has ne operator", () => {
      expect(COMPARISON_OPERATORS.NE).toBe("ne");
    });

    test("has lt operator", () => {
      expect(COMPARISON_OPERATORS.LT).toBe("lt");
    });

    test("has gt operator", () => {
      expect(COMPARISON_OPERATORS.GT).toBe("gt");
    });

    test("has lte operator", () => {
      expect(COMPARISON_OPERATORS.LTE).toBe("lte");
    });

    test("has gte operator", () => {
      expect(COMPARISON_OPERATORS.GTE).toBe("gte");
    });

    test("has in operator", () => {
      expect(COMPARISON_OPERATORS.IN).toBe("in");
    });

    test("has contains operator", () => {
      expect(COMPARISON_OPERATORS.CONTAINS).toBe("contains");
    });

    test("has between operator", () => {
      expect(COMPARISON_OPERATORS.BETWEEN).toBe("between");
    });

    test("has null operator", () => {
      expect(COMPARISON_OPERATORS.NULL).toBe("null");
    });

    test("has nnull operator", () => {
      expect(COMPARISON_OPERATORS.NNULL).toBe("nnull");
    });

    test("has startswith operator", () => {
      expect(COMPARISON_OPERATORS.STARTSWITH).toBe("startswith");
    });

    test("has startswiths operator", () => {
      expect(COMPARISON_OPERATORS.STARTSWITHS).toBe("startswiths");
    });

    test("has endswith operator", () => {
      expect(COMPARISON_OPERATORS.ENDSWITH).toBe("endswith");
    });

    test("has endswiths operator", () => {
      expect(COMPARISON_OPERATORS.ENDSWITHS).toBe("endswiths");
    });
  });
});
