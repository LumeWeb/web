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
  WorkspaceStore,
  createWorkspaceHandlers,
  resetWorkspaceState,
} from "./msw";

const pinStore = new PinStore();
const tusStore = new TusStore();
const operationStore = new OperationStore();
const websiteStore = new WebsiteStore();
const ipnsStore = new IPNSStore();
const workspaceStore = new WorkspaceStore();

await pinStore.initializeDefaults();
await websiteStore.initializeDefaults();
await ipnsStore.initializeDefaults();
await workspaceStore.initializeDefaults();

const allHandlers = [
  ...createPinHandlers(pinStore),
  ...createUploadHandlers(tusStore, operationStore),
  ...createWebsiteHandlers(websiteStore, ipnsStore),
  ...createWorkspaceHandlers(workspaceStore),
];

export const test = await createIntTest({
  handlers: allHandlers,
  resetState: () => {
    // Reset mock data state before each test to ensure isolation
    resetPinServiceState(pinStore);
    resetUploadState(tusStore, operationStore);
    resetWebsitesIPNSState(websiteStore, ipnsStore);
    resetWorkspaceState(workspaceStore);
  },
  enableLogging: true,
});
