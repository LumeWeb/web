/**
 * Check if the current environment is Node.js.
 */
export function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && process?.versions?.node !== undefined;
}
