import React from "react";
import { generateCurrencySyntax } from "./template-generators";

/**
 * GoCurrency - Currency formatting component
 *
 * Formats a number as currency using Go template pipeline syntax
 * Outputs: {{.Total | formatCurrency "USD"}}
 *
 * @example
 * <GoCurrency var="total" currency="USD" />
 * // Outputs: {{.Total | formatCurrency "USD"}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoCurrency var="$item.price" currency="USD" />
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{$item.Price | formatCurrency "USD"}}{{end}}
 *
 * @note
 * The formatCurrency function must be registered in Go:
 *   funcMap := template.FuncMap{
 *     "formatCurrency": formatCurrency,
 *   }
 *
 *   func formatCurrency(amount float64, currency string) string {
 *     return fmt.Sprintf("%s %.2f", currency, amount)
 *   }
 */
export interface GoCurrencyProps {
  /** Variable name containing the amount */
  var: string;
  /** Currency code (e.g., "USD", "EUR", "GBP") */
  currency: string;
}

export const GoCurrency: React.FC<GoCurrencyProps> = ({
  var: varName,
  currency,
}) => {
  return <>{generateCurrencySyntax(varName, currency)}</>;
};

/**
 * Helper function to get Go template currency formatting syntax as a string
 * Useful for use in JSX attributes where components can't be used
 *
 * @example
 * <Text>Total: {goCurrency("total", "USD")}</Text>
 * // Outputs: Total: {{.Total | formatCurrency "USD"}}
 */
export function goCurrency(varName: string, currency: string): string {
  return generateCurrencySyntax(varName, currency);
}
