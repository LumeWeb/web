import React from "react";
import { normalizeVarName, splitElseBlocks } from "./utils";
import { generateEqualStart, generateElse, generateEnd } from "./template-generators";
import { GoElse } from "./GoIf";

/**
 * GoEqual - Equality check component
 *
 * Checks if two values are equal using Go template eq function
 * Outputs: {{eq .Status "active"}}...{{end}}
 *
 * @example
 * <GoEqual var1="status" var2="active">
 *   <Text>Status is active</Text>
 * </GoEqual>
 * // Outputs: {{eq .Status "active"}}<Text>Status is active</Text>{{end}}
 *
 * @example with else
 * <GoEqual var1="status" var2="active">
 *   <Text>Status is active</Text>
 *   <GoElse>
 *     <Text>Status is not active</Text>
 *   </GoElse>
 * </GoEqual>
 * // Outputs: {{if eq .Status "active"}}<Text>Status is active</Text>{{else}}<Text>Status is not active</Text>{{end}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoEqual var1="$item.type" var2="premium">
 *     <Text>Premium item</Text>
 *   </GoEqual>
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{if eq $item.Type "premium"}}<Text>Premium item</Text>{{end}}{{end}}
 *
 * @example comparing two variables
 * <GoEqual var1="count" var2="maxCount">
 *   <Text>Reached maximum</Text>
 * </GoEqual>
 * // Outputs: {{eq .Count .MaxCount}}<Text>Reached maximum</Text>{{end}}
 */
export interface GoEqualProps {
  /** First variable to compare */
  var1: string;
  /** Second variable or literal value to compare */
  var2: string;
  /** Content to show when values are equal */
  children: React.ReactNode;
}

export const GoEqual: React.FC<GoEqualProps> = ({ var1, var2, children }) => {
  const hasElse = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) && (child.type as any)?.name === "GoElse",
  );

  if (hasElse) {
    const { ifBlock, elseBlock } = splitElseBlocks(children);

    return (
      <>
        {generateEqualStart(var1, var2)}
        {ifBlock}
        {generateElse()}
        {elseBlock}
        {generateEnd()}
      </>
    );
  }

  return (
    <>
      {generateEqualStart(var1, var2)}
      {children}
      {generateEnd()}
    </>
  );
};
