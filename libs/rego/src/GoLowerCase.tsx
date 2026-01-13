import React from "react";
import { generateTransformSyntax } from "./template-generators";

/**
 * GoLowerCase - Lowercase transformation component
 *
 * Converts text to lowercase using Go template pipeline syntax
 * Outputs: {{.Text | lower}}
 *
 * @example standalone
 * <GoLowerCase>
 *   <GoVar name="name" />
 * </GoLowerCase>
 * // Outputs: {{.Name | lower}}
 *
 * @example in pipeline
 * <GoPipe>
 *   <GoVar name="title" />
 *   <GoLowerCase />
 *   <GoTrim />
 * </GoPipe>
 * // Outputs: {{.Title | lower | trim}}
 *
 * @note
 * Requires the `lower` function to be registered in Go:
 *   funcMap := template.FuncMap{
 *     "lower": strings.ToLower,
 *   }
 */
export interface GoLowerCaseProps {
  children?: React.ReactNode;
}

export const GoLowerCase: React.FC<GoLowerCaseProps> = ({ children }) => {
  const childArray = React.Children.toArray(children);
  const firstChild = childArray[0];
  
  if (!React.isValidElement(firstChild) || (firstChild.type as any)?.name !== "GoVar") {
    return null;
  }

  const varName = firstChild.props.name;
  return <>{generateTransformSyntax(varName, "lower")}</>;
};
