/** Uses the package worker entry rather than a test-owned media pipeline. */
import { installSiaVideoSourceWorker } from "@lumeweb/sia-video-source/worker/setup";
import { createRemoteMockSdk } from "@lumeweb/sia-testing/sdk";

installSiaVideoSourceWorker({
  createSdk: (config) => {
    if (!config) throw new Error("Mock network configuration is required");
    return Promise.resolve(
      createRemoteMockSdk({ client: "reader", url: config.indexerUrl }),
    );
  },
});
