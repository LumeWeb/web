import React from "react";
import { generateCommentSyntax } from "./template-generators";

/**
 * GoComment - Template comment component
 *
 * Adds comments to Go templates that are ignored during execution
 * Outputs Go template comment syntax that is ignored during execution
 *
 * @example
 * <GoComment>This section shows user profile information</GoComment>
 * // Outputs template comment syntax
 *
 * @example multiline
 * <GoComment>
 *   This is a longer comment
 *   that spans multiple lines
 * </GoComment>
 * // Outputs template comment syntax
 *
 * @note
 * Comments are completely ignored by Go during template execution.
 * They're useful for documentation and debugging.
 */
export interface GoCommentProps {
  /** Comment text */
  children: React.ReactNode;
}

export const GoComment: React.FC<GoCommentProps> = ({ children }) => {
  // Convert children to string
  const text = React.Children.toArray(children).join(" ");

  return <>{generateCommentSyntax(text)}</>;
};
