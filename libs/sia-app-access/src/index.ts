/** Framework-free credential storage and access adapter contracts. */
export * from "./access-types.ts";
export { createMemoryCredentialStore } from "./credentials.ts";
export type {
  CredentialScope,
  CredentialStore,
  MemoryCredentialStore,
} from "./credentials.ts";
