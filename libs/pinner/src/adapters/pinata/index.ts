/**
 * Pinata Adapters
 *
 * Exports for both 2.x (recommended) and 1.x (legacy) adapters
 */

// v2 adapter (recommended, primary)
export { pinataAdapter } from "./v2";
export type { PinataAdapter } from "./v2";

// 1.x legacy adapter (backward compatibility)
export { pinataLegacyAdapter } from "./legacy";
export type { PinataLegacyAdapter } from "./legacy";

// Shared types and utilities
export * from "./shared";
