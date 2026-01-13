/**
 * Pure template syntax generation functions
 *
 * These functions generate Go template syntax strings without any React dependencies.
 * They can be tested in isolation and reused by both React components and helper functions.
 */

import { normalizeVarName } from "./utils";

/**
 * Generates Go template variable syntax
 *
 * @param name - Variable name (e.g., "userName" or "$item.Name")
 * @returns Go template syntax (e.g., "{{.userName}}" or "{{$item.Name}}")
 *
 * @example
 * generateVarSyntax("userName") // "{{.userName}}"
 * generateVarSyntax("$item.Name") // "{{$item.Name}}"
 */
export function generateVarSyntax(name: string): string {
  const isLocalVar = name.startsWith("$");
  return isLocalVar ? `{{${name}}}` : `{{.${name}}}`;
}

/**
 * Generates Go template if statement opening syntax
 *
 * @param condition - Condition variable name
 * @returns Template opening syntax for if statement
 *
 * @example
 * generateIfStart("showBanner") // "{{if .showBanner}}"
 */
export function generateIfStart(condition: string): string {
  return `{{if .${condition}}}`;
}

/**
 * Generates Go template else syntax
 *
 * @returns Template else syntax
 *
 * @example
 * generateElse() // "{{else}}"
 */
export function generateElse(): string {
  return "{{else}}";
}

/**
 * Generates Go template equal check opening syntax
 *
 * @param var1 - First variable name
 * @param var2 - Second variable or literal value
 * @returns Template opening syntax for equal check
 *
 * @example
 * generateEqualStart("status", "active") // "{{if eq .Status "active"}}"
 * generateEqualStart("$item.type", "premium") // "{{if eq $item.Type "premium"}}"
 */
export function generateEqualStart(var1: string, var2: string): string {
  const var1Syntax = normalizeVarName(var1);
  
  const isLocalVar2 = var2.startsWith("$");
  const isNumberLiteral = !isNaN(Number(var2));
  let var2Syntax: string;
  
  if (isLocalVar2) {
    var2Syntax = var2;
  } else if (isNumberLiteral) {
    var2Syntax = var2;
  } else if (var2.startsWith('"')) {
    var2Syntax = var2;
  } else if (var2.startsWith("'")) {
    // Convert single-quoted string to double-quoted for Go template
    var2Syntax = `"${var2.slice(1, -1)}"`;
  } else {
    var2Syntax = "." + var2;
  }

  return `{{if eq ${var1Syntax} ${var2Syntax}}}`;
}

/**
 * Generates Go template empty check opening syntax
 *
 * @param varName - Variable name to check
 * @returns Template opening syntax for empty check
 *
 * @example
 * generateEmptyStart("items") // "{{if not .Items}}"
 * generateEmptyStart("$item.description") // "{{if not $item.Description}}"
 */
export function generateEmptyStart(varName: string): string {
  const varSyntax = normalizeVarName(varName);
  return `{{if not ${varSyntax}}}`;
}

/**
 * Generates Go template range loop opening syntax
 *
 * @param items - Array variable name
 * @param indexName - Optional index variable name
 * @param elementName - Optional element variable name
 * @returns Template opening syntax for range loop
 *
 * @example
 * generateRangeStart("items", undefined, undefined) // "{{range .items}}"
 * generateRangeStart("items", undefined, "item") // "{{range $item := .items}}"
 * generateRangeStart("items", "i", "item") // "{{range $i, $item := .items}}"
 */
export function generateRangeStart(
  items: string,
  indexName?: string,
  elementName?: string
): string {
  if (indexName && elementName) {
    return `{{range $${indexName}, $${elementName} := .${items}}}`;
  }
  if (elementName) {
    return `{{range $${elementName} := .${items}}}`;
  }
  return `{{range .${items}}}`;
}

/**
 * Generates Go template with statement opening syntax
 *
 * @param value - Variable name to switch context to
 * @returns Template opening syntax for with statement
 *
 * @example
 * generateWithStart("user") // "{{with .user}}"
 */
export function generateWithStart(value: string): string {
  return `{{with .${value}}}`;
}

/**
 * Generates Go template end syntax
 *
 * @returns Template end syntax
 *
 * @example
 * generateEnd() // "{{end}}"
 */
export function generateEnd(): string {
  return "{{end}}";
}









/**
 * Generates Go template with statement syntax
 *
 * @param value - Variable name to switch context to
 * @param hasFallback - Whether a fallback block exists
 * @returns Template syntax for with statement
 *
 * @example
 * generateWithSyntax("user", false) // "{{with .user}}...{{end}}"
 * generateWithSyntax("user", true) // "{{with .user}}...{{else}}...{{end}}"
 */
export function generateWithSyntax(value: string, hasFallback: boolean = false): string {
  if (hasFallback) {
    return `{{with .${value}}}{{else}}{{end}}`;
  }
  return `{{with .${value}}}{{end}}`;
}

/**
 * Generates Go template pipeline syntax
 *
 * @param value - Base value (e.g., ".Text" or "$item.title")
 * @param transforms - Array of transform specifiers (e.g., ["upper", "truncate 50"])
 * @returns Template syntax for pipeline
 *
 * @example
 * generatePipeSyntax(".Text", ["upper"]) // "{{.Text | upper}}"
 * generatePipeSyntax("$item.title", ["truncate 50", "upper"]) // "{{$item.Title | truncate 50 | upper}}"
 */
export function generatePipeSyntax(value: string, transforms: string[]): string {
  let pipeline = value;
  transforms.forEach((transform) => {
    pipeline += ` | ${transform}`;
  });
  return `{{${pipeline}}}`;
}

/**
 * Generates Go template variable assignment syntax
 *
 * @param name - Variable name (without $ prefix)
 * @param assignment - Assignment expression
 * @returns Template syntax for variable assignment
 *
 * @example
 * generateLetSyntax("currentUser", ".user") // "{{$currentUser := .user}}"
 * generateLetSyntax("processedText", ".RawText | truncate 100") // "{{$processedText := .RawText | truncate 100}}"
 */
export function generateLetSyntax(name: string, assignment: string): string {
  return `{{$${name} := ${assignment}}}`;
}

/**
 * Generates Go template printf formatting syntax
 *
 * @param format - Printf format string
 * @param args - Array of argument strings
 * @returns Template syntax for printf
 *
 * @example
 * generateFormatSyntax("%s (%s)", [".Name", ".Email"]) // "{{"%s (%s)" | printf .Name .Email}}"
 * generateFormatSyntax("Hello %s", []) // "{{"Hello %s" | printf}}"
 */
export function generateFormatSyntax(format: string, args: string[]): string {
  if (args.length === 0) {
    return `{{"${format}" | printf}}`;
  }
  return `{{"${format}" | printf ${args.join(" ")}}}`;
}

/**
 * Generates Go template truncate syntax
 *
 * @param varName - Variable name
 * @param length - Maximum length
 * @returns Template syntax for truncate
 *
 * @example
 * generateTruncateSyntax("description", 100) // "{{.Description | truncate 100}}"
 * generateTruncateSyntax("$item.title", 50) // "{{$item.Title | truncate 50}}"
 */
export function generateTruncateSyntax(varName: string, length: number): string {
  const varSyntax = normalizeVarName(varName);
  return `{{${varSyntax} | truncate ${length}}}`;
}

/**
 * Generates Go template date formatting syntax
 *
 * @param varName - Variable name containing the date
 * @param format - Go date format layout
 * @returns Template syntax for date formatting
 *
 * @example
 * generateDateSyntax("createdAt", "Jan 2, 2006") // "{{.CreatedAt | formatDate "Jan 2, 2006"}}"
 */
export function generateDateSyntax(varName: string, format: string): string {
  const varSyntax = normalizeVarName(varName);
  return `{{${varSyntax} | formatDate "${format}"}}`;
}

/**
 * Generates Go template currency formatting syntax
 *
 * @param varName - Variable name containing the amount
 * @param currency - Currency code
 * @returns Template syntax for currency formatting
 *
 * @example
 * generateCurrencySyntax("total", "USD") // "{{.Total | formatCurrency "USD"}}"
 */
export function generateCurrencySyntax(varName: string, currency: string): string {
  const varSyntax = normalizeVarName(varName);
  return `{{${varSyntax} | formatCurrency "${currency}"}}`;
}

/**
 * Generates Go template function invocation syntax
 *
 * @param name - Function name
 * @param args - Array of argument strings
 * @returns Template syntax for function call
 *
 * @example
 * generateFuncSyntax("pluralize", [".count", '"item"', '"items"']) // "{{pluralize .Count "item" "items"}}"
 */
export function generateFuncSyntax(name: string, args: string[]): string {
  return `{{${name} ${args.join(" ")}}}`;
}

/**
 * Generates Go template URL syntax
 *
 * @param baseURL - Base URL (can be literal or variable)
 * @param params - Array of parameter variable names (optional)
 * @returns Template syntax for URL
 *
 * @example
 * generateUrlSyntax('"/dashboard"', []) // '{{"/dashboard"}}'
 * generateUrlSyntax(".dashboardUrl", []) // "{{.DashboardUrl}}"
 * generateUrlSyntax('"/verify'", [".Token", ".Email"]) // '{{"/verify" | addQueryParams .Token .Email}}'
 */
export function generateUrlSyntax(baseURL: string, params: string[] = []): string {
  if (params.length === 0) {
    return `{{${baseURL}}}`;
  }
  return `{{${baseURL} | addQueryParams ${params.join(" ")}}}`;
}

/**
 * Generates Go template string transform syntax
 *
 * @param varName - Variable name
 * @param transform - Transform type (upper, lower, trim)
 * @returns Template syntax for transform
 *
 * @example
 * generateTransformSyntax("name", "upper") // "{{.Name | upper}}"
 * generateTransformSyntax("$item.title", "lower") // "{{$item.Title | lower}}"
 */
export function generateTransformSyntax(varName: string, transform: "upper" | "lower" | "trim"): string {
  const varSyntax = normalizeVarName(varName);
  return `{{${varSyntax} | ${transform}}}`;
}

/**
 * Generates Go template chunk syntax
 *
 * @param items - Array variable name
 * @param size - Chunk size
 * @param elementName - Chunk element variable name
 * @param indexName - Optional chunk index variable name
 * @returns Template syntax for chunk
 *
 * @example
 * generateChunkSyntax("items", 3, "chunk", undefined) // "{{$chunk := chunk .Items 3}}"
 * generateChunkSyntax("items", 3, "chunk", "chunkIndex") // "{{$chunkIndex, $chunk := chunk .Items 3}}"
 */
export function generateChunkSyntax(
  items: string,
  size: number,
  elementName: string,
  indexName?: string
): string {
  const itemsSyntax = normalizeVarName(items);
  
  if (indexName) {
    return `{{$${indexName}, $${elementName} := chunk ${itemsSyntax} ${size}}}`;
  }
  return `{{$${elementName} := chunk ${itemsSyntax} ${size}}}`;
}

/**
 * Generates Go template define opening syntax
 *
 * @param name - Template name
 * @returns Template opening syntax for define
 *
 * @example
 * generateDefineStart("email-header") // '{{define "email-header"}}'
 */
export function generateDefineStart(name: string): string {
  return `{{define "${name}"}}`;
}

/**
 * Generates Go template define syntax
 *
 * @param name - Template name
 * @returns Template syntax for define
 *
 * @example
 * generateDefineSyntax("email-header") // '{{define "email-header"}}...{{end}}'
 */
export function generateDefineSyntax(name: string): string {
  return `{{define "${name}"}}{{end}}`;
}

/**
 * Generates Go template invocation syntax
 *
 * @param name - Template name
 * @param data - Optional data variable name
 * @returns Template syntax for template invocation
 *
 * @example
 * generateTemplateSyntax("email-header", undefined) // '{{template "email-header"}}'
 * generateTemplateSyntax("user-info", "currentUser") // '{{template "user-info" .currentUser}}'
 */
export function generateTemplateSyntax(name: string, data?: string): string {
  if (data) {
    return `{{template "${name}" .${data}}}`;
  }
  return `{{template "${name}"}}`;
}

/**
 * Generates Go template comment syntax
 *
 * @param text - Comment text
 * @returns Template syntax for comment
 *
 * @example
 * generateCommentSyntax("This is a comment") // '{{&#47;* This is a comment *&#47;}}'
 */
export function generateCommentSyntax(text: string): string {
  return `{{/* ${text} */}}`;
}


