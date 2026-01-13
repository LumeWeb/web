import React from "react";
import { generateUrlSyntax } from "./template-generators";
import { normalizeVarName } from "./utils";

/**
 * GoUrl - URL generation component
 *
 * Generates URLs with optional query parameters using Go template pipeline syntax
 *
 * @example simple path
 * <GoUrl path="/dashboard" />
 * // Outputs: {{"/dashboard"}}
 *
 * @example with variable path
 * <GoUrl var="dashboardUrl" />
 * // Outputs: {{.DashboardUrl}}
 *
 * @example with query parameters
 * <GoUrl path="/verify" params={["token", "email"]} />
 * // Outputs: {{"/verify" | addQueryParams .Token .Email}}
 *
 * @example with variable path and parameters
 * <GoUrl var="profileUrl" params={["id", "tab"]} />
 * // Outputs: {{.ProfileUrl | addQueryParams .Id .Tab}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoUrl var="$item.url" params={["ref", "source"]} />
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{$item.Url | addQueryParams .Ref .Source}}{{end}}
 *
 * @example with literal values
 * <GoUrl path="/search" params={["q", "page"]} literalValues={["", "1"]} />
 * // Outputs: {{"/search" | addQueryParams "" "1"}}
 *
 * @note
 * The addQueryParams function must be registered in Go:
 *   funcMap := template.FuncMap{
 *     "addQueryParams": addQueryParams,
 *   }
 *
 *   func addQueryParams(baseURL string, params ...string) string {
 *     if len(params) == 0 {
 *       return baseURL
 *     }
 *     values := url.Values{}
 *     for i := 0; i < len(params); i += 2 {
 *       if i+1 < len(params) && params[i+1] != "" {
 *         values.Set(params[i], params[i+1])
 *       }
 *     }
 *     if len(values) > 0 {
 *       return baseURL + "?" + values.Encode()
 *     }
 *     return baseURL
 *   }
 */
export interface GoUrlProps {
  /** Static URL path (e.g., "/dashboard") */
  path?: string;
  /** Variable name containing the URL */
  var?: string;
  /** Array of parameter variable names (alternating: key, value) */
  params?: string[];
  /** Array of literal values for parameters (must match params length) */
  literalValues?: string[];
}

export const GoUrl: React.FC<GoUrlProps> = ({
  path,
  var: varName,
  params,
  literalValues,
}) => {
  // Determine the base URL
  let urlBase: string;

  if (path) {
    urlBase = `"${path}"`;
  } else if (varName) {
    urlBase = normalizeVarName(varName);
  } else {
    return null;
  }

  // If no parameters, just output the URL
  if (!params || params.length === 0) {
    return <>{generateUrlSyntax(urlBase)}</>;
  }

  // Build parameter list
  const paramList: string[] = [];
  params.forEach((paramName, index) => {
    // Check if there's a literal value for this parameter
    if (literalValues && literalValues[index] !== undefined) {
      const literal = literalValues[index];
      // Use literal value (quoted for Go template)
      paramList.push(`"${literal}"`);
    } else {
      // Use variable reference
      const paramSyntax = normalizeVarName(paramName);
      paramList.push(paramSyntax);
    }
  });

  return <>{generateUrlSyntax(urlBase, paramList)}</>;
};

/**
 * Helper function to generate Go template URL syntax as a string
 * Useful for use in JSX attributes where components can't be used
 *
 * @example simple path
 * <Button href={goUrl("/dashboard")}>Dashboard</Button>
 * // Outputs: href="{{"/dashboard"}}"
 *
 * @example with variable
 * <Button href={goUrl({ var: "dashboardUrl" })}>Dashboard</Button>
 * // Outputs: href="{{.DashboardUrl}}"
 */
export interface GoUrlOptions {
  /** Static URL path (e.g., "/dashboard") */
  path?: string;
  /** Variable name containing the URL */
  var?: string;
  /** Array of parameter variable names (alternating: key, value) */
  params?: string[];
  /** Array of literal values for parameters (must match params length) */
  literalValues?: string[];
}

export function goUrl(options: string | GoUrlOptions): string {
  // Handle simple string path
  if (typeof options === "string") {
    return generateUrlSyntax(`"${options}"`);
  }

  const { path, var: varName, params, literalValues } = options;

  // Determine the base URL
  let urlBase: string;

  if (path) {
    urlBase = `"${path}"`;
  } else if (varName) {
    urlBase = normalizeVarName(varName);
  } else {
    return "";
  }

  // If no parameters, just output the URL
  if (!params || params.length === 0) {
    return generateUrlSyntax(urlBase);
  }

  // Build parameter list
  const paramList: string[] = [];
  params.forEach((paramName, index) => {
    const paramSyntax = normalizeVarName(paramName);

    // Check if there's a literal value for this parameter
    if (literalValues && literalValues[index] !== undefined) {
      const literal = literalValues[index];
      if (literal !== "") {
        paramList.push(`"${paramName}"`);
        paramList.push(`"${literal}"`);
      }
    } else {
      paramList.push(paramSyntax);
    }
  });

  return generateUrlSyntax(urlBase, paramList);
}
