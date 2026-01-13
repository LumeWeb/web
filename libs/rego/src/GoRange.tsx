import React from "react";
import { generateRangeStart, generateElse, generateEnd } from "./template-generators";

/**
 * GoRange - Loop iteration component
 *
 * Outputs Go template range syntax with support for variable assignment:
 *
 * - {{range .Items}} - dot (.) becomes the element
 * - {{$item := range .Items}} - element assigned to $item
 * - {{$i, $item := range .Items}} - index and element assigned
 *
 * @example basic (dot becomes element)
 * <GoRange items="cartItems">
 *   <div>Item: <GoVar name="Name" /></div>
 * </GoRange>
 * // Outputs: {{range .cartItems}}<div>Item: {{.Name}}</div>{{end}}
 *
 * @example with element name
 * <GoRange items="items" elementName="item">
 *   <div>{{$item.Name}}</div>
 * </GoRange>
 * // Outputs: {{range $item := .items}}<div>{{$item.Name}}</div>{{end}}
 *
 * @example with index and element names
 * <GoRange items="items" indexName="i" elementName="item">
 *   <div>{{$i}}: {{$item.Name}}</div>
 * </GoRange>
 * // Outputs: {{range $i, $item := .items}}<div>{{$i}}: {{$item.Name}}</div>{{end}}
 */
export interface GoRangeProps {
  /** Variable name of the array/slice to iterate over */
  items: string;
  /** Optional: name for the loop index variable (e.g., "i") */
  indexName?: string;
  /** Optional: name for the loop element variable (e.g., "item") */
  elementName?: string;
  /** Optional: content to show if the range is empty */
  empty?: React.ReactNode;
  /** Content to render for each item */
  children: React.ReactNode;
}

export const GoRange: React.FC<GoRangeProps> = ({
  items,
  indexName,
  elementName,
  empty,
  children,
}) => {
  const hasEmpty = !!empty;

  if (hasEmpty) {
    return (
      <>
        {generateRangeStart(items, indexName, elementName)}
        {children}
        {generateElse()}
        {empty}
        {generateEnd()}
      </>
    );
  }

  return (
    <>
      {generateRangeStart(items, indexName, elementName)}
      {children}
      {generateEnd()}
    </>
  );
};
