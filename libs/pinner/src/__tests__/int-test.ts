import { createIntTest } from "./create-int-test";
import { allHandlers } from "./msw-handlers";

export const test = await createIntTest({
  handlers: allHandlers,
  enableLogging: true,
});
