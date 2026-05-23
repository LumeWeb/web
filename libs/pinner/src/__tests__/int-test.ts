import { createIntTest } from "./create-int-test";
import {
  PinStore,
  createPinHandlers,
  resetPinServiceState,
  TusStore,
  OperationStore,
  createUploadHandlers,
  resetUploadState,
  WebsiteStore,
  IPNSStore,
  createWebsiteHandlers,
  resetWebsitesIPNSState,
} from "./msw";

const pinStore = new PinStore();
const tusStore = new TusStore();
const operationStore = new OperationStore();
const websiteStore = new WebsiteStore();
const ipnsStore = new IPNSStore();

await pinStore.initializeDefaults();
await websiteStore.initializeDefaults();
await ipnsStore.initializeDefaults();

const allHandlers = [
  ...createPinHandlers(pinStore),
  ...createUploadHandlers(tusStore, operationStore),
  ...createWebsiteHandlers(websiteStore, ipnsStore),
];

export const test = await createIntTest({
  handlers: allHandlers,
  resetState: () => {
    // Reset mock data state before each test to ensure isolation
    resetPinServiceState(pinStore);
    resetUploadState(tusStore, operationStore);
    resetWebsitesIPNSState(websiteStore, ipnsStore);
  },
  enableLogging: true,
});
