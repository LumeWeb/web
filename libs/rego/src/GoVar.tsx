import React from "react";
import { generateVarSyntax } from "./template-generators";

/**
 * GoVar - Variable interpolation component
 *
 * Outputs Go template variable syntax:
 * - {{.VarName}} for field access (dot notation)
 * - {{$VarName}} for local variables (e.g., loop variables)
 *
 * @example field access
 * <GoVar name="userName" />
 * // Outputs: {{.userName}}
 *
 * @example local variable (from GoRange)
 * <GoRange items="items" elementName="item">
 *   <GoVar name="$item.Name" />
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{$item.Name}}{{end}}
 */
export interface GoVarProps {
  /** Variable name in Go template (e.g., "userName" or "$item.Name") */
  name: string;
  /** Children content (ignored, used for fallback in React preview) */
  children?: React.ReactNode;
}

export const GoVar: React.FC<GoVarProps> = ({ name }) => {
  return <>{generateVarSyntax(name)}</>;
};

/**
 * Helper function to get Go template variable syntax as a string
 * Useful for use in JSX attributes where components can't be used
 *
 * @example
 * <Button href={goVar("DashboardURL")}>Go to Dashboard</Button>
 * // Outputs: href="{{.DashboardURL}}"
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <Link href={goVar("$item.url")}>View</Link>
 * </GoRange>
 * // Outputs: href="{{$item.Url}}"
 */
export function goVar(name: string): string {
  return generateVarSyntax(name);
}

/**
 * Helper function to get Go template variable syntax for local variables
 * Always treats the name as a local variable (starts with $)
 *
 * @example
 * <GoRange items="items" elementName="item">
 *   <Link href={goLocalVar("item.url")}>View</Link>
 * </GoRange>
 * // Outputs: href="{{$item.Url}}"
 */
export function goLocalVar(name: string): string {
  return `{{${name}}}`;
}

/**
 * Helper function to get Go template variable syntax for field access
 * Always treats the name as a field (starts with .)
 *
 * @example
 * <Button href={goFieldVar("DashboardURL")}>Go to Dashboard</Button>
 * // Outputs: href="{{.DashboardURL}}"
 */
export function goFieldVar(name: string): string {
  return `{{.${name}}}`;
}
