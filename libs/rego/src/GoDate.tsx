import React from "react";
import { generateDateSyntax } from "./template-generators";

/**
 * GoDate - Date formatting component
 *
 * Formats a date variable using Go template pipeline syntax
 * Outputs: {{.Date | formatDate "Jan 2, 2006"}}
 *
 * @example
 * <GoDate var="createdAt" format="Jan 2, 2006" />
 * // Outputs: {{.CreatedAt | formatDate "Jan 2, 2006"}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoDate var="$item.createdAt" format="Jan 2, 2006" />
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{$item.CreatedAt | formatDate "Jan 2, 2006"}}{{end}}
 *
 * @note
 * The formatDate function must be registered in Go:
 *   funcMap := template.FuncMap{
 *     "formatDate": formatDate,
 *   }
 *
 *   func formatDate(date time.Time, layout string) string {
 *     return date.Format(layout)
 *   }
 */
export interface GoDateProps {
  /** Variable name containing the date */
  var: string;
  /** Go date format layout (e.g., "Jan 2, 2006", "2006-01-02", "3:04 PM") */
  format: string;
}

export const GoDate: React.FC<GoDateProps> = ({ var: varName, format }) => {
  return <>{generateDateSyntax(varName, format)}</>;
};

/**
 * Helper function to get Go template date formatting syntax as a string
 * Useful for use in JSX attributes where components can't be used
 *
 * @example
 * <Text>Due: {goDate("dueDate", "Jan 2, 2006")}</Text>
 * // Outputs: Due: {{.DueDate | formatDate "Jan 2, 2006"}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <Text>{goDate("$item.createdAt", "2006-01-02")}</Text>
 * </GoRange>
 * // Outputs: {{$item.CreatedAt | formatDate "2006-01-02"}}
 */
export function goDate(varName: string, format: string): string {
  return generateDateSyntax(varName, format);
}
