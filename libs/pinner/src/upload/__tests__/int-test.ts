import { createIntTest } from "@/__tests__/create-int-test";
import { uploadHandlers } from "./msw-handlers";

export const test = await createIntTest({
  handlers: uploadHandlers,
  enableLogging: false,
});
