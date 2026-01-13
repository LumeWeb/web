/**
 * @lumeweb/rego - React-to-Go Template DSL for Email Generation
 *
 * This library provides React components that output Go template syntax
 * wrapped around React Email components. The generated HTML contains
 * Go template tags that can be executed by Go at runtime.
 */

// Core DSL components
export { GoVar, goVar, goLocalVar, goFieldVar } from './GoVar'
export { GoIf, GoElse } from './GoIf'
export { GoRange } from './GoRange'
export { GoWith } from './GoWith'

// Template Composition
export { GoDefine } from './GoDefine'
export { GoUseTemplate } from './GoUseTemplate'
export { GoBlock } from './GoBlock'

// Data Transformation Helpers
export { GoDate, goDate } from './GoDate'
export { GoCurrency, goCurrency } from './GoCurrency'
export { GoTruncate } from './GoTruncate'

// String Transformations
export { GoUpperCase } from './GoUpperCase'
export { GoLowerCase } from './GoLowerCase'
export { GoTrim } from './GoTrim'

// Pipeline and Variable Assignment
export { GoPipe } from './GoPipe'
export { GoLet } from './GoLet'
export { GoFormat } from './GoFormat'

// Function Invocation
export { GoFunc, goFunc } from './GoFunc'

// URL Generation
export { GoUrl, goUrl } from './GoUrl'

// Array Operations
export { GoChunk } from './GoChunk'

// Comments
export { GoComment } from './GoComment'

// Conditional Helpers
export { GoEqual } from './GoEqual'
export { GoEmpty } from './GoEmpty'

// Types
export type { TemplateData } from './types'

// Utilities
export { normalizeVarName, splitElseBlocks, extractGoVarName } from './utils'

// Template Generators
export {
  generateVarSyntax,
  generateIfStart,
  generateElse,
  generateEnd,
  generateEqualStart,
  generateEmptyStart,
  generateRangeStart,
  generateWithStart,
  generatePipeSyntax,
  generateLetSyntax,
  generateFormatSyntax,
  generateTruncateSyntax,
  generateDateSyntax,
  generateCurrencySyntax,
  generateFuncSyntax,
  generateUrlSyntax,
  generateTransformSyntax,
  generateChunkSyntax,
  generateDefineStart,
  generateDefineSyntax,
  generateTemplateSyntax,
  generateCommentSyntax,
} from './template-generators'
