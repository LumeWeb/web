/** Portable application ports keep application credentials separate from fixture authority. */
export { createMockApplication } from "./testing/application-client.js";
export { createMockAuth } from "./testing/auth-client.js";
export type { MockAuthRequest } from "./testing/auth-client.js";
export { createMockReader } from "./testing/client.js";
export { createMockOwnerShares } from "./testing/owner-client.js";
export type { MockCredential } from "./testing/runtime.js";
export type { MockConnection } from "./testing/transport.js";
export type {
  OwnerShareDetails,
  OwnerSharePort,
  OwnerShareRef,
  PageRequest,
  ReadPage,
} from "./testing/types.js";

export type { ReadObject, ReadPort } from "./testing/types.js";
export type {
  ApplicationObject,
  ApplicationPort,
  EventPage,
  ObjectCursor,
  ObjectEvent,
  TestFile,
} from "./testing/types.js";
