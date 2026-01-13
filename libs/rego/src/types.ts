/**
 * React-to-Go Template DSL for Email Generation
 *
 * This library provides a thin React DSL layer that wraps React Email components
 * and outputs Go template syntax. The generated HTML contains Go template tags
 * that can be executed by Go at runtime.
 */

/**
 * Represents a Go template variable reference
 * Outputs: {{.VariableName}}
 */
export interface GoTemplateVar {
  type: 'var'
  name: string
  defaultValue?: string
}

/**
 * Creates a Go template variable reference
 * @example
 * <GoVar name="userName">Default Name</GoVar>
 * // Outputs: {{.userName}}
 */
export function GoVar(name: string, defaultValue?: string): GoTemplateVar {
  return { type: 'var', name, defaultValue }
}

/**
 * Template data interface - the shape of data passed to Go templates
 */
export interface TemplateData {
  [key: string]: any
}
