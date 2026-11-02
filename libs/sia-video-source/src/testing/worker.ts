/** Installs the packaged video worker with credential-aware mock reads for playback tests. */
import { installSiaVideoSourceWorker } from "../worker-setup.js";
import { createMockPlaybackSdk } from "./reader.js";
installSiaVideoSourceWorker({
  createSdk(config, appSeed, sharingSeed) {
    if (!config) throw new Error("Playback tests require a scoped reader URL");
    return Promise.resolve(
      createMockPlaybackSdk(config.indexerUrl, appSeed, sharingSeed),
    );
  },
});
