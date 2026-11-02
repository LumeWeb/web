/** Loopback listeners expose an existing mock backend rather than owning a second store. */
export { startMockServer } from "./testing/http.js";
export type { MockConnection, MockEndpoint } from "./testing/transport.js";
