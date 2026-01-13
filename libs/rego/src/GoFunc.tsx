import React from "react";
import { generateFuncSyntax } from "./template-generators";
import { normalizeVarName } from "./utils";

/**
 * GoFunc - Function invocation component
 *
 * Invokes custom Go template functions
 * Outputs: {{funcName arg1 arg2 arg3}}
 *
 * @example with variable
 * <GoFunc name="pluralize" var="itemCount" args={["item", "items"]} />
 * // Outputs: {{pluralize .ItemCount "item" "items"}}
 *
 * @example with multiple variables
 * <GoFunc name="formatFullName" vars={["firstName", "lastName"]} />
 * // Outputs: {{formatFullName .FirstName .LastName}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoFunc name="formatPrice" var="$item.price" args={["USD"]} />
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{formatPrice $item.Price "USD"}}{{end}}
 *
 * @example with literal arguments
 * <GoFunc name="repeat" var="text" args={[3]} />
 * // Outputs: {{repeat .Text 3}}
 *
 * @note
 * The function must be registered in Go:
 *   funcMap := template.FuncMap{
 *     "pluralize": pluralize,
 *     "formatFullName": formatFullName,
 *     "formatPrice": formatPrice,
 *     "repeat": strings.Repeat,
 *   }
 */
export interface GoFuncProps {
  /** Function name to invoke */
  name: string;
  /** Optional primary variable argument */
  var?: string;
  /** Optional additional variables to pass */
  vars?: string[];
  /** Optional literal or string arguments */
  args?: (string | number)[];
}

export const GoFunc: React.FC<GoFuncProps> = ({
  name,
  var: varName,
  vars,
  args,
}) => {
  const allArgs: string[] = [];

  // Add primary variable
  if (varName) {
    allArgs.push(normalizeVarName(varName));
  }

  // Add additional variables
  if (vars) {
    vars.forEach((v) => {
      allArgs.push(normalizeVarName(v));
    });
  }

  // Add literal arguments
  if (args) {
    args.forEach((arg) => {
      if (typeof arg === "number") {
        allArgs.push(arg.toString());
      } else if (typeof arg === "string") {
        // Check if it's a variable (starts with $ or .) or a literal string
        const isLocalVar = arg.startsWith("$");
        const isFieldRef = arg.startsWith(".");
        if (isLocalVar || isFieldRef) {
          allArgs.push(arg);
        } else {
          // It's a literal string, quote it
          allArgs.push(`"${arg}"`);
        }
      }
    });
  }

  return <>{generateFuncSyntax(name, allArgs)}</>;
};

/**
 * Helper function to get Go template function invocation syntax as a string
 * Useful for use in JSX attributes where components can't be used
 *
 * @example
 * <Text>{goFunc("pluralize", { var: "itemCount", args: ["item", "items"] })}</Text>
 * // Outputs: {{pluralize .ItemCount "item" "items"}}
 *
 * @example with multiple variables
 * <Text>{goFunc("formatFullName", { vars: ["firstName", "lastName"] })}</Text>
 * // Outputs: {{formatFullName .FirstName .LastName}}
 */
export interface GoFuncOptions {
  /** Optional primary variable argument */
  var?: string;
  /** Optional additional variables to pass */
  vars?: string[];
  /** Optional literal or string arguments */
  args?: (string | number)[];
}

export function goFunc(name: string, options: GoFuncOptions): string {
  const { var: varName, vars, args } = options;
  const allArgs: string[] = [];

  // Add primary variable
  if (varName) {
    allArgs.push(normalizeVarName(varName));
  }

  // Add additional variables
  if (vars) {
    vars.forEach((v) => {
      allArgs.push(normalizeVarName(v));
    });
  }

  // Add literal arguments
  if (args) {
    args.forEach((arg) => {
      if (typeof arg === "number") {
        allArgs.push(arg.toString());
      } else if (typeof arg === "string") {
        // Check if it's a variable (starts with $ or .) or a literal string
        const isLocalVar = arg.startsWith("$");
        const isFieldRef = arg.startsWith(".");
        if (isLocalVar || isFieldRef) {
          allArgs.push(arg);
        } else {
          // It's a literal string, quote it
          allArgs.push(`"${arg}"`);
        }
      }
    });
  }

  return generateFuncSyntax(name, allArgs);
}
