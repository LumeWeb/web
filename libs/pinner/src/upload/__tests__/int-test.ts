import { createIntTest } from "@/__tests__/create-int-test";
import { TusStore, OperationStore, createUploadHandlers, resetUploadState } from "@/__tests__/msw";

const tusStore = new TusStore();
const operationStore = new OperationStore();

export const test = await createIntTest({
  handlers: createUploadHandlers(tusStore, operationStore),
  resetState: () => resetUploadState(tusStore, operationStore),
  enableLogging: false,
});
