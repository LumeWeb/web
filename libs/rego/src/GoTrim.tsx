import React from "react";
import { generateTransformSyntax } from "./template-generators";

/**
 * GoTrim - Trim whitespace transformation component
 *
 * Removes leading and trailing whitespace using Go template pipeline syntax
 * Outputs: {{.Text | trim}}
 *
 * @example standalone
 * <GoTrim>
 *   <GoVar name="name" />
 * </GoTrim>
 * // Outputs: {{.Name | trim}}
 *
 * @example in pipeline
 * <GoPipe>
 *   <GoVar name="description" />
 *   <GoTruncate length="100" />
 *   <GoTrim />
 * </GoPipe>
 * // Outputs: {{.Description | truncate 100 | trim}}
 *
 * @note
 * Requires the `trim` function to be registered in Go:
 *   funcMap := template.FuncMap{
 *     "trim": strings.TrimSpace,
 *   }
 */
export interface GoTrimProps {
  children?: React.ReactNode;
}

export const GoTrim: React.FC<GoTrimProps> = ({ children }) => {
  const childArray = React.Children.toArray(children);
  const firstChild = childArray[0];
  
  if (!React.isValidElement(firstChild) || (firstChild.type as any)?.name !== "GoVar") {
    return null;
  }

  const varName = firstChild.props.name;
  return <>{generateTransformSyntax(varName, "trim")}</>;
};
