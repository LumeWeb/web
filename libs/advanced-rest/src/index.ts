/**
 * Nested REST Data Provider for Refine with Ky
 *
 * @remarks
 * Provides CRUD operations for nested REST resources using dot-notation and template URLs.
 * Configure resources through meta properties in request parameters.
 *
 * @example
 * ```ts
 * // Explicit template with parameter map
 * dataProvider.getList({
 *   resource: 'cases',
 *   meta: {
 *     template: 'tenants/{tenant}/projects/{project}/cases',
 *     params: {
 *       tenant: '123',
 *       project: '456'
 *     }
 *   }
 * })
 * // URL: /tenants/123/projects/456/cases
 * ```
 *
 * ### Key Features
 *
 * - **Template-based URLs** - Explicit path templates in meta.template
 * - **Parameter Mapping** - Simple key/value store for template params:
 *   ```ts
 *   meta: { paramsMap: { [key: string]: string } }
 *   ```
 * - **Dot Notation** - Resource can use dot notation for nested resources:
 *   ```ts
 *   resource: 'tenant.project.case' // auto-converted to template
 *   ```
 * - **ID Handling** - Current resource ID automatically appended to URL
 * - **Custom Operations** - Support for custom endpoints via `custom` method
 *
 * ### Template Resolution Rules
 *
 * 1. Templates can be defined in meta.template or derived from resource name
 * 2. Required parameters are validated before making requests
 * 3. IDs are automatically appended to the resolved URL path
 * 4. Operations create nested endpoints under the resource path
 *
 * Example for "tenant.project.case" with ID:
 * ```ts
 * dataProvider.getOne({
 *   resource: 'tenant.project.case',
 *   id: '789',
 *   meta: {
 *     template: 'tenants/{tenant}/projects/{project}/cases',
 *     paramsMap: {
 *       tenant: '123',
 *       project: '456'
 *     }
 *   }
 * })
 * // URL: /tenants/123/projects/456/cases/789
 * ```
 *
 * ### Parameter Propagation
 *
 * Parent parameters are explicitly passed through the `paramsMap`:
 * ```ts
 * dataProvider.getList({
 *   resource: 'project.case',
 *   meta: {
 *     template: 'projects/{project}/cases',
 *     paramsMap: {
 *       project: '456' // From previous context
 *     }
 *   }
 * })
 * // URL: /projects/456/cases
 * ```
 *
 * For complex hierarchies, compose parameters from multiple sources:
 * ```ts
 * dataProvider.getOne({
 *   resource: 'company.tenant.project.case',
 *   id: '789',
 *   meta: {
 *     template: 'companies/{company}/tenants/{tenant}/projects/{project}/cases',
 *     paramsMap: {
 *       company: '101112', // From organization context
 *       tenant: '123',     // From user selection
 *       project: '456'     // From parent resource
 *     }
 *   }
 * })
 * // URL: /companies/101112/tenants/123/projects/456/cases/789
 * ```
 *
 * @packageDocumentation
 */

import { dataProvider } from "./provider";

export { dataProvider } from "./provider";
export { generateFilter } from "./utils/generateFilter";
export { generateSort } from "./utils/generateSort";
/**
 * Error Classes
 *
 * - NestedParamError: Missing required parent parameters
 * - TemplateResolutionError: Invalid template configuration
 * - OperationNotSupportedError: Unregistered custom operation
 */
export { NestedParamError, TemplateResolutionError } from "./utils/generateUrl";

export { httpClient } from "./utils/kyInstance";
export default dataProvider;
