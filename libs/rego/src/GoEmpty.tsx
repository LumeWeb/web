import React from "react";
import { normalizeVarName, splitElseBlocks } from "./utils";
import { generateEmptyStart, generateElse, generateEnd } from "./template-generators";
import { GoElse } from "./GoIf";

/**
 * GoEmpty - Empty check component
 *
 * Checks if a value is empty (nil, zero value, empty string, etc.) using Go template logic
 * Outputs: {{if not .Items}}...{{end}}
 *
 * @example
 * <GoEmpty var="items">
 *   <Text>No items found</Text>
 * </GoEmpty>
 * // Outputs: {{if not .Items}}<Text>No items found</Text>{{end}}
 *
 * @example with else
 * <GoEmpty var="items">
 *   <Text>No items found</Text>
 *   <GoElse>
 *   <GoRange items="items">
 *     <Text><GoVar name="Name" /></Text>
 *   </GoRange>
 *   </GoElse>
 * </GoEmpty>
 * // Outputs: {{if not .Items}}<Text>No items found</Text>{{else}}{{range .Items}}<Text>{{.Name}}</Text>{{end}}{{end}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoEmpty var="$item.description">
 *     <Text>No description</Text>
 *   </GoEmpty>
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{if not $item.Description}}<Text>No description</Text>{{end}}{{end}}
 */
export interface GoEmptyProps {
  /** Variable name to check */
  var: string;
  /** Content to show when value is empty */
  children: React.ReactNode;
}

export const GoEmpty: React.FC<GoEmptyProps> = ({ var: varName, children }) => {
  const hasElse = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) && (child.type as any)?.name === "GoElse",
  );

  if (hasElse) {
    const { ifBlock, elseBlock } = splitElseBlocks(children);

    return (
      <>
        {generateEmptyStart(varName)}
        {ifBlock}
        {generateElse()}
        {elseBlock}
        {generateEnd()}
      </>
    );
  }

  return (
    <>
      {generateEmptyStart(varName)}
      {children}
      {generateEnd()}
    </>
  );
};
