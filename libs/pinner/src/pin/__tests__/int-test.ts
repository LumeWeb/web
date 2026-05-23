import { createIntTest } from "@/__tests__/create-int-test";
import { PinStore, createPinHandlers, resetPinServiceState } from "@/__tests__/msw";

const pinStore = new PinStore();

await pinStore.initializeDefaults();

export const test = await createIntTest({
  handlers: createPinHandlers(pinStore),
  resetState: () => resetPinServiceState(pinStore),
  enableLogging: false,
});
