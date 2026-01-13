import React from "react";
import { generateTransformSyntax } from "./template-generators";

/**
 * GoUpperCase - Uppercase transformation component
 *
 * Converts text to uppercase using Go template pipeline syntax
 * Outputs: {{.Text | upper}}
 *
 * @example standalone
 * <GoUpperCase>
 *   <GoVar name="name" />
 * </GoUpperCase>
 * // Outputs: {{.Name | upper}}
 *
 * @example in pipeline
 * <GoPipe>
 *   <GoVar name="title" />
 *   <GoTruncate length="50" />
 *   <GoUpperCase />
 * </GoPipe>
 * // Outputs: {{.Title | truncate 50 | upper}}
 *
 * @note
 * Requires the `upper` function to be registered in Go:
 *   funcMap := template.FuncMap{
 *     "upper": strings.ToUpper,
 *   }
 */
export interface GoUpperCaseProps {
  children?: React.ReactNode;
}

export const GoUpperCase: React.FC<GoUpperCaseProps> = ({ children }) => {
  // Extract GoVar name from children
  const childArray = React.Children.toArray(children);
  const firstChild = childArray[0];
  
  if (!React.isValidElement(firstChild) || (firstChild.type as any)?.name !== "GoVar") {
    return null;
  }

  const varName = firstChild.props.name;
  return <>{generateTransformSyntax(varName, "upper")}</>;
};
