import React from "react";
import { splitElseBlocks } from "./utils";
import { generateIfStart, generateElse, generateEnd } from "./template-generators";

/**
 * GoIf - Conditional rendering component
 *
 * Outputs Go template conditional syntax: {{if .Condition}}...{{end}}
 * or with else: {{if .Condition}}...{{else}}...{{end}}
 *
 * @example
 * <GoIf condition="showBanner">
 *   <div>Banner content</div>
 * </GoIf>
 * // Outputs: {{if .showBanner}}<div>Banner content</div>{{end}}
 *
 * @example with else
 * <GoIf condition="isLoggedIn">
 *   <div>Welcome back!</div>
 *   <GoElse>
 *     <div>Please log in</div>
 *   </GoElse>
 * </GoIf>
 * // Outputs: {{if .isLoggedIn}}<div>Welcome back!</div>{{else}}<div>Please log in</div>{{end}}
 */
export interface GoIfProps {
  /** Variable name or condition to check */
  condition: string;
  /** Content to show when condition is truthy */
  children: React.ReactNode;
}

/**
 * GoElse - Else clause for GoIf
 */
export interface GoElseProps {
  /** Content to show when condition is falsy */
  children: React.ReactNode;
}

export const GoElse: React.FC<GoElseProps> = ({ children }) => {
  // This component is used as a child of GoIf
  // The actual template syntax is handled by GoIf
  return <>{children}</>;
};

export const GoIf: React.FC<GoIfProps> = ({ condition, children }) => {
  const hasElse = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) && (child.type as any)?.name === "GoElse",
  );

  if (hasElse) {
    const { ifBlock, elseBlock } = splitElseBlocks(children);

    return (
      <>
        {generateIfStart(condition)}
        {ifBlock}
        {generateElse()}
        {elseBlock}
        {generateEnd()}
      </>
    );
  }

  return (
    <>
      {generateIfStart(condition)}
      {children}
      {generateEnd()}
    </>
  );
};
