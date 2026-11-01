/** The executable worker entry stays separate so custom setup imports cannot install a default listener. */
import {
  installSiaVideoSourceWorker,
  isBrowserWorkerGlobalScope,
} from "./worker-setup.ts";

export * from "./worker-setup.ts";

if (isBrowserWorkerGlobalScope()) {
  installSiaVideoSourceWorker();
}
