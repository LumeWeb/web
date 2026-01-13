import React from "react";
import { generateDefineStart } from "./template-generators";

/**
 * GoDefine - Template definition component
 *
 * Defines a named template that can be reused with GoUseTemplate or GoBlock
 * Outputs Go template define syntax: {{define "name"}}...{{end}}
 *
 * @example
 * <GoDefine name="email-header">
 *   <Header>
 *     <Logo src="logo.png" />
 *     <Text>Welcome!</Text>
 *   </Header>
 * </GoDefine>
 *
 * @example with GoUseTemplate
 * <GoDefine name="email-header">
 *   <Header><Text>Welcome!</Text></Header>
 * </GoDefine>
 *
 * <GoUseTemplate name="email-header" />
 * // Outputs: {{define "email-header"}}...{{end}}{{template "email-header"}}
 */
export interface GoDefineProps {
  /** Template name for reuse */
  name: string;
  /** Content of the template definition */
  children: React.ReactNode;
}

export const GoDefine: React.FC<GoDefineProps> = ({ name, children }) => {
  return (
    <>
      {generateDefineStart(name)}
      {children}
      {"{{end}}"}
    </>
  );
};
