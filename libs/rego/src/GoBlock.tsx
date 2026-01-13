import React from "react";

/**
 * GoBlock - Template block component
 *
 * Defines a template block that can be overridden in child templates
 * Combines define and template invocation: {{block "name" .}}...{{end}}
 *
 * @example
 * <GoBlock name="email-content">
 *   <Text>Default content</Text>
 * </GoBlock>
 * // Outputs: {{block "email-content" .}}<Text>Default content</Text>{{end}}
 *
 * @example with override in child template
 * // In base template:
 * <GoBlock name="email-content">
 *   <Text>Default content</Text>
 * </GoBlock>
 *
 * // In child template:
 * <GoDefine name="email-content">
 *   <Text>Custom content</Text>
 * </GoDefine>
 * <GoUseTemplate name="base-template" />
 */
export interface GoBlockProps {
  /** Block name for override */
  name: string;
  /** Optional context to pass (defaults to current dot) */
  context?: string;
  /** Content of the block */
  children: React.ReactNode;
}

export const GoBlock: React.FC<GoBlockProps> = ({
  name,
  context,
  children,
}) => {
  if (context) {
    // Remove leading dot if present
    const contextSyntax = context.startsWith('.') ? context : '.' + context;
    return (
      <>
        {'{{block "' + name + '" ' + contextSyntax + "}}"}
        {children}
        {"{{end}}"}
      </>
    );
  }
  return (
    <>
      {'{{block "' + name + '" .}}'}
      {children}
      {"{{end}}"}
    </>
  );
};
