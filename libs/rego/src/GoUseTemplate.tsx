import React from "react";
import { generateTemplateSyntax } from "./template-generators";

/**
 * GoUseTemplate - Template invocation component
 *
 * Invokes a previously defined template
 * Outputs Go template syntax: {{template "name"}} or {{template "name" .Data}}
 *
 * @example
 * <GoDefine name="email-header">
 *   <Header><Text>Welcome!</Text></Header>
 * </GoDefine>
 *
 * <GoUseTemplate name="email-header" />
 * // Outputs: {{template "email-header"}}
 *
 * @example with data
 * <GoDefine name="user-info">
 *   <div>
 *     <Text>Name: <GoVar name="Name" /></Text>
 *     <Text>Email: <GoVar name="Email" /></Text>
 *   </div>
 * </GoDefine>
 *
 * <GoUseTemplate name="user-info" data="currentUser" />
 * // Outputs: {{template "user-info" .currentUser}}
 */
export interface GoUseTemplateProps {
  /** Name of the template to invoke */
  name: string;
  /** Optional data to pass to the template (defaults to current context) */
  data?: string;
  /** Children content (ignored) */
  children?: React.ReactNode;
}

export const GoUseTemplate: React.FC<GoUseTemplateProps> = ({ name, data }) => {
  return <>{generateTemplateSyntax(name, data)}</>;
};
