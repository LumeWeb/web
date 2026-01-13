import React from "react";
import { generateTruncateSyntax } from "./template-generators";

/**
 * GoTruncate - Text truncation component
 *
 * Truncates a string to a specified length using Go template pipeline syntax
 * Outputs: {{.Description | truncate 100}}
 *
 * @example
 * <GoTruncate var="description" length="100" />
 * // Outputs: {{.Description | truncate 100}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoTruncate var="$item.description" length="50" />
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{$item.Description | truncate 50}}{{end}}
 *
 * @note
 * The truncate function must be registered in Go:
 *   funcMap := template.FuncMap{
 *     "truncate": truncate,
 *   }
 *
 *   func truncate(text string, length int) string {
 *     if len(text) <= length {
 *       return text
 *     }
 *     return text[:length] + "..."
 *   }
 */
export interface GoTruncateProps {
  /** Variable name containing the text */
  var: string;
  /** Maximum length of the string */
  length: number;
}

export const GoTruncate: React.FC<GoTruncateProps> = ({
  var: varName,
  length,
}) => {
  return <>{generateTruncateSyntax(varName, length)}</>;
};
