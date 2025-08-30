import { FormFieldType } from "../fields";
import { AutocompleteRule, registerAutocompleteRule } from "./rules";

const defaultRules: AutocompleteRule[] = [
  // Explicit value always wins
  {
    evaluate: (fieldConfig: any) => {
      return fieldConfig.autocomplete;
    },
    name: "explicit",
    priority: 0,
  },

  // Field type based rules
  {
    evaluate: (fieldConfig: any) => {
      if (fieldConfig.type === FormFieldType.EMAIL) {
        return "email";
      }
      return undefined;
    },
    name: "email-type",
    priority: 10,
  },

  // Name pattern based rules
  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name?.includes("email")) {
        return "email";
      }
      return undefined;
    },
    name: "email-name",
    priority: 20,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (
        name &&
        (name.includes("first") || name.includes("given")) &&
        name.includes("name")
      ) {
        return "given-name";
      }
      return undefined;
    },
    name: "given-name",
    priority: 30,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (
        name &&
        (name.includes("last") ||
          name.includes("family") ||
          name.includes("sur")) &&
        name.includes("name")
      ) {
        return "family-name";
      }
      return undefined;
    },
    name: "family-name",
    priority: 30,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name && (name.includes("username") || name.includes("login"))) {
        return "username";
      }
      return undefined;
    },
    name: "username",
    priority: 40,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (
        name &&
        (name.includes("otp") ||
          (name.includes("verification") && name.includes("code")) ||
          name.includes("one-time-code") ||
          name.includes("2fa") ||
          name.includes("twofactor") ||
          name.includes("two-factor"))
      ) {
        return "one-time-code";
      }
      return undefined;
    },
    name: "one-time-code",
    priority: 45,
  },

  {
    evaluate: (fieldConfig: any, context?: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (fieldConfig.type === FormFieldType.PASSWORD) {
        if (name?.includes("current") && name.includes("password")) {
          return "current-password";
        }
        if (name === "password" && context?.formPurpose === "login") {
          return "current-password";
        }
        if (name === "password" && context?.formPurpose === "change-password") {
          return "current-password";
        }
      }
      return undefined;
    },
    name: "current-password",
    priority: 50,
  },

  {
    evaluate: (fieldConfig: any, context?: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (fieldConfig.type === FormFieldType.PASSWORD) {
        if (name?.includes("new") && name.includes("password")) {
          return "new-password";
        }
        if (name?.includes("confirm") && name.includes("password")) {
          return "new-password";
        }
        if (
          name === "password" &&
          (context?.formPurpose === "register" ||
            context?.formPurpose === "reset-password")
        ) {
          return "new-password";
        }
      }
      return undefined;
    },
    name: "new-password",
    priority: 50,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name) {
        if (
          (name.includes("cc") || name.includes("card")) &&
          name.includes("number")
        ) {
          return "cc-number";
        }
        if (
          (name.includes("cc") || name.includes("card")) &&
          (name.includes("exp") || name.includes("expiration"))
        ) {
          return "cc-exp";
        }
        if (
          (name.includes("cc") || name.includes("card")) &&
          name.includes("month")
        ) {
          return "cc-exp-month";
        }
        if (
          (name.includes("cc") || name.includes("card")) &&
          name.includes("year")
        ) {
          return "cc-exp-year";
        }
        if (
          (name.includes("cc") || name.includes("card")) &&
          (name.includes("csc") || name.includes("cvv"))
        ) {
          return "cc-csc";
        }
      }
      return undefined;
    },
    name: "credit-card",
    priority: 60,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name) {
        // address line 2 before generic street-address
        if (
          name.includes("address2") ||
          name.includes("address_2") ||
          name.includes("address line 2") ||
          name.includes("address-line2")
        ) {
          return "address-line2";
        }
        if (
          name.includes("address1") ||
          name.includes("address_1") ||
          name.includes("address line 1") ||
          name.includes("address-line1")
        ) {
          return "address-line1";
        }
        if (name.includes("address") && !name.includes("email")) {
          return "street-address";
        }
        if (name.includes("city")) {
          return "address-level2";
        }
        if (name.includes("state") || name.includes("province")) {
          return "address-level1";
        }
        if (name.includes("zip") || name.includes("postal")) {
          return "postal-code";
        }
        if (name.includes("country")) {
          // Default to full country name unless explicitly a code
          if (name.includes("code") || name.includes("iso")) {
            return "country";
          }
          return "country-name";
        }
      }
      return undefined;
    },
    name: "address",
    priority: 70,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name && (name.includes("phone") || name.includes("tel"))) {
        return "tel";
      }
      return undefined;
    },
    name: "phone",
    priority: 80,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name && (name.includes("bday") || name.includes("birth"))) {
        return "bday";
      }
      return undefined;
    },
    name: "birthday",
    priority: 90,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name && (name.includes("sex") || name.includes("gender"))) {
        return "sex";
      }
      return undefined;
    },
    name: "gender",
    priority: 100,
  },

  {
    evaluate: (fieldConfig: any) => {
      const name = fieldConfig.name?.toString().toLowerCase();
      if (name && (name.includes("url") || name.includes("website"))) {
        return "url";
      }
      return undefined;
    },
    name: "url",
    priority: 110,
  },
];

export function getDefaultAutocompleteRules(): AutocompleteRule[] {
  return [...defaultRules];
}

export function registerDefaultRules(): void {
  // Register all default rules
  defaultRules.forEach((rule) => {
    registerAutocompleteRule(rule);
  });
}
