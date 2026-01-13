import React from "react";
import { generateWithStart, generateElse, generateEnd } from "./template-generators";

/**
 * GoWith - Context switching component
 *
 * Outputs Go template with syntax: {{with .Value}}...{{end}}
 * Changes the dot (.) to the specified value within the block
 *
 * @example
 * <GoWith value="user">
 *   <div>Name: <GoVar name="Name" /></div>
 *   <div>Email: <GoVar name="Email" /></div>
 * </GoWith>
 * // Outputs: {{with .user}}<div>Name: {{.Name}}</div><div>Email: {{.Email}}</div>{{end}}
 *
 * @example with else
 * <GoWith value="user" fallback="No user found">
 *   <div>Welcome, <GoVar name="Name" /></div>
 * </GoWith>
 * // Outputs: {{with .user}}<div>Welcome, {{.Name}}</div>{{else}}No user found{{end}}
 */
export interface GoWithProps {
  /** Variable name to switch context to */
  value: string;
  /** Optional: content to show if value is empty/falsy */
  fallback?: React.ReactNode;
  /** Content to render with the new context */
  children: React.ReactNode;
}

export const GoWith: React.FC<GoWithProps> = ({
  value,
  fallback,
  children,
}) => {
  const hasFallback = !!fallback;

  if (hasFallback) {
    return (
      <>
        {generateWithStart(value)}
        {children}
        {generateElse()}
        {fallback}
        {generateEnd()}
      </>
    );
  }

  return (
    <>
      {generateWithStart(value)}
      {children}
      {generateEnd()}
    </>
  );
};
