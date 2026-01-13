import React from "react";
import { generateFormatSyntax } from "./template-generators";

/**
 * GoFormat - String formatting component
 *
 * Uses Go's printf syntax for string formatting
 * Outputs: {{"%s (%s)" | printf .Name .Email}}
 *
 * @example
 * <GoFormat format="%s (%s)">
 *   <GoVar name="name" />
 *   <GoVar name="email" />
 * </GoFormat>
 * // Outputs: {{"%s (%s)" | printf .Name .Email}}
 *
 * @example with local variables
 * <GoRange items="items" elementName="item">
 *   <GoFormat format="Item #%d: %s">
 *     <GoVar name="$item.id" />
 *     <GoVar name="$item.name" />
 *   </GoFormat>
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{"Item #%d: %s" | printf $item.Id $item.Name}}{{end}}
 *
 * @example with GoLet
 * <GoLet name="displayName">
 *   <GoFormat format="%s %s">
 *     <GoVar name="user.firstName" />
 *     <GoVar name="user.lastName" />
 *   </GoFormat>
 * </GoLet>
 * // Outputs: {{$displayName := printf "%s %s" .User.FirstName .User.LastName}}
 *
 * @note
 * Uses Go's printf format specifiers:
 * - %s - string
 * - %d - integer
 * - %f - float
 * - %v - default format
 * - %.2f - float with 2 decimal places
 * - etc.
 */
export interface GoFormatProps {
  /** Printf format string (e.g., "%s (%s)", "Item #%d: %s") */
  format: string;
  /** Arguments for the format string (typically GoVar components) */
  children?: React.ReactNode;
}

export const GoFormat: React.FC<GoFormatProps> = ({ format, children }) => {
  const args = React.Children.toArray(children || []);

  // Build argument list
  const argList = args.map((arg) => {
    if (React.isValidElement(arg) && (arg.type as any)?.name === "GoVar") {
      const varName = arg.props.name;
      const isLocalVar = varName.startsWith("$");
      return isLocalVar ? varName : "." + varName;
    }
    return arg;
  });

  return <>{generateFormatSyntax(format, argList)}</>;
};
