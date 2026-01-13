import React from "react";
import { GoVar } from "./GoVar";

/**
 * Normalizes a variable name to Go template syntax.
 * 
 * If the variable starts with "$", it's treated as a local variable
 * and returned as-is (e.g., "$myVar" stays "$myVar").
 * Otherwise, it's prefixed with "." to reference a field from the current context
 * (e.g., "myVar" becomes ".myVar").
 * 
 * @param varName - The variable name to normalize
 * @returns The normalized variable name for Go template usage
 * 
 * @example
 * normalizeVarName("userName") // Returns ".userName"
 * normalizeVarName("$item") // Returns "$item"
 */
export function normalizeVarName(varName: string): string {
  const isLocalVar = varName.startsWith("$");
  return isLocalVar ? varName : "." + varName;
}

/**
 * Splits React children into if-block and else-block sections.
 * 
 * This function iterates through children and separates them into two arrays:
 * - All children before the first GoElse component go into ifBlock
 * - All children after the first GoElse component go into elseBlock
 * 
 * @param children - React children to split
 * @returns Object containing ifBlock and elseBlock arrays
 * 
 * @example
 * const { ifBlock, elseBlock } = splitElseBlocks(
 *   <GoIf condition="isActive">
 *     <Text>Active</Text>
 *     <GoElse />
 *     <Text>Inactive</Text>
 *   </GoIf>
 * );
 */
export function splitElseBlocks(
  children: React.ReactNode
): { ifBlock: React.ReactNode[]; elseBlock: React.ReactNode[] } {
  const ifBlock: React.ReactNode[] = [];
  const elseBlock: React.ReactNode[] = [];
  let inElse = false;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if this is a GoElse component
      const isGoElse =
        (child.type as any)?.name === "GoElse" ||
        (child.type as any)?.displayName === "GoElse";

      if (isGoElse) {
        inElse = true;
        // Add the GoElse component's children to elseBlock
        if (child.props.children) {
          elseBlock.push(child.props.children);
        }
        return;
      }
    }

    if (inElse) {
      elseBlock.push(child);
    } else {
      ifBlock.push(child);
    }
  });

  return { ifBlock, elseBlock };
}

/**
 * Extracts the variable name from a GoVar component in the children.
 * 
 * This function looks for a GoVar component as the first child and returns
 * its name prop. Returns null if no GoVar is found or if the GoVar has no name.
 * 
 * @param children - React children to search
 * @returns The variable name from GoVar, or null if not found
 * 
 * @example
 * extractGoVarName(<GoVar name="userName" />) // Returns "userName"
 * extractGoVarName(<Text>Hello</Text>) // Returns null
 */
export function extractGoVarName(children: React.ReactNode): string | null {
  const childArray = React.Children.toArray(children);
  const firstChild = childArray[0];

  if (
    React.isValidElement(firstChild) &&
    (firstChild.type as any)?.name === "GoVar"
  ) {
    const varName = firstChild.props.name;
    return varName || null;
  }

  return null;
}
