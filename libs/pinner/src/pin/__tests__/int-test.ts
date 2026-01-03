import { createIntTest } from "@/__tests__/create-int-test";
import { pinHandlers, resetPinServiceState } from "./msw-handlers";

export const test = await createIntTest({
  handlers: pinHandlers,
  resetState: resetPinServiceState,
  enableLogging: false,
});
