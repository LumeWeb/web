import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FormFieldType } from "../fields";
import { FormFieldConfig } from "../types";
import {
  getAutocompleteValue,
  registerAutocompleteRule,
  unregisterAutocompleteRule,
} from "./rules";

const TEST_RULE_NAME = "test-rule-to-remove";

describe("Autocomplete Rules", () => {
  // Clean up any registered rules after each test
  afterEach(() => {
    unregisterAutocompleteRule(TEST_RULE_NAME);
  });

  describe("getAutocompleteValue", () => {
    it("should return explicit autocomplete value if set", () => {
      const fieldConfig = {
        autocomplete: "custom-value",
        name: "test",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("custom-value");
    });

    it("should derive email from email field type", () => {
      const fieldConfig = {
        name: "emailAddress",
        type: FormFieldType.EMAIL,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("email");
    });

    it("should derive email from field name containing email", () => {
      const fieldConfig = {
        name: "userEmail",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("email");
    });

    it("should derive given-name from first name field", () => {
      const fieldConfig = {
        name: "firstName",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("given-name");
    });

    it("should derive family-name from last name field", () => {
      const fieldConfig = {
        name: "lastName",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("family-name");
    });

    it("should derive username from username field", () => {
      const fieldConfig = {
        name: "username",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("username");
    });

    it("should derive current-password from password field with current in name", () => {
      const fieldConfig = {
        name: "currentPassword",
        type: FormFieldType.PASSWORD,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("current-password");
    });

    it("should derive new-password from password field with new in name", () => {
      const fieldConfig = {
        name: "newPassword",
        type: FormFieldType.PASSWORD,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("new-password");
    });

    it("should derive new-password from password field with confirm in name", () => {
      const fieldConfig = {
        name: "confirmPassword",
        type: FormFieldType.PASSWORD,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("new-password");
    });

    it("should derive current-password from password field in login context", () => {
      const fieldConfig = {
        name: "password",
        type: FormFieldType.PASSWORD,
      };
      const context = {
        formPurpose: "login",
      };

      expect(getAutocompleteValue(fieldConfig, context)).toBe(
        "current-password",
      );
    });

    it("should derive new-password from password field in register context", () => {
      const fieldConfig = {
        name: "password",
        type: FormFieldType.PASSWORD,
      };
      const context = {
        formPurpose: "register",
      };

      expect(getAutocompleteValue(fieldConfig, context)).toBe("new-password");
    });

    it("should derive credit card number", () => {
      const fieldConfig = {
        name: "ccNumber",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("cc-number");
    });

    it("should derive credit card expiration", () => {
      const fieldConfig = {
        name: "ccExpiration",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("cc-exp");
    });

    it("should derive credit card CSC", () => {
      const fieldConfig = {
        name: "ccCsc",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("cc-csc");
    });

    it("should derive address fields", () => {
      expect(
        getAutocompleteValue({
          name: "streetAddress",
          type: FormFieldType.TEXT,
        }),
      ).toBe("street-address");
      expect(
        getAutocompleteValue({ name: "city", type: FormFieldType.TEXT }),
      ).toBe("address-level2");
      expect(
        getAutocompleteValue({ name: "state", type: FormFieldType.TEXT }),
      ).toBe("address-level1");
      expect(
        getAutocompleteValue({ name: "zipCode", type: FormFieldType.TEXT }),
      ).toBe("postal-code");
      expect(
        getAutocompleteValue({ name: "country", type: FormFieldType.TEXT }),
      ).toBe("country-name");
      expect(
        getAutocompleteValue({
          name: "country-name",
          type: FormFieldType.TEXT,
        }),
      ).toBe("country-name");
    });

    it("should derive phone number", () => {
      const fieldConfig = {
        name: "phoneNumber",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("tel");
    });

    it("should derive birthday", () => {
      const fieldConfig = {
        name: "birthDate",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("bday");
    });

    it("should derive gender", () => {
      const fieldConfig = {
        name: "gender",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("sex");
    });

    it("should derive URL", () => {
      const fieldConfig = {
        name: "website",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("url");
    });

    it("should return undefined for unknown fields", () => {
      const fieldConfig = {
        name: "unknownField",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBeUndefined();
    });
  });

  describe("registerAutocompleteRule", () => {
    const testRule = {
      evaluate: vi.fn(() => "test-value"),
      name: TEST_RULE_NAME,
      priority: 1000,
    };

    beforeEach(() => {
      // Clear any existing test rules
      unregisterAutocompleteRule(TEST_RULE_NAME);
    });

    afterEach(() => {
      // Clean up after each test
      unregisterAutocompleteRule(TEST_RULE_NAME);
    });

    it("should register a new rule", () => {
      registerAutocompleteRule(testRule);

      const fieldConfig = {
        name: "test",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("test-value");
      expect(testRule.evaluate).toHaveBeenCalledWith(fieldConfig, undefined);
    });

    it("should replace an existing rule with the same name", () => {
      const newRule = {
        evaluate: vi.fn(() => "new-value"),
        name: TEST_RULE_NAME,
        priority: 1000,
      };

      registerAutocompleteRule(testRule);
      registerAutocompleteRule(newRule);

      const fieldConfig = {
        name: "test",
        type: FormFieldType.TEXT,
      };

      expect(getAutocompleteValue(fieldConfig)).toBe("new-value");
      expect(newRule.evaluate).toHaveBeenCalledWith(fieldConfig, undefined);
    });
  });

  describe("unregisterAutocompleteRule", () => {
    const testRule = {
      evaluate: (fieldConfig: FormFieldConfig) => {
        if (fieldConfig.name === TEST_RULE_NAME) {
          return "new-value";
        }
        return undefined;
      },
      name: TEST_RULE_NAME,
      priority: 1000,
    };

    beforeEach(() => {
      registerAutocompleteRule(testRule);
    });

    it("should remove a registered rule", () => {
      const fieldConfig = {
        name: TEST_RULE_NAME,
        type: FormFieldType.TEXT,
      };

      // First verify the rule matches and returns the expected value
      expect(getAutocompleteValue(fieldConfig)).toBe("new-value");

      // Now unregister it
      unregisterAutocompleteRule(TEST_RULE_NAME);

      // Should not use the removed rule and return undefined
      expect(getAutocompleteValue(fieldConfig)).toBeUndefined();
    });
  });
});
