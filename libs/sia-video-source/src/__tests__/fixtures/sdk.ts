/** Reader fixtures use the shared payload adapter; stalled and deferred transports stay in their regression tests. */
import { createMockNetwork, createMockObject } from "@lumeweb/sia-testing/sdk";

export function fakeObject(size: number) {
  return createMockObject("test-object", size);
}

export function fakeSdk(payload: Uint8Array) {
  const network = createMockNetwork();
  const account = network.model.createAccount({ publicKey: "reader" });
  network.seedObject(account.id, "test-object", payload);
  return network.createSdk({ accountId: account.id });
}
