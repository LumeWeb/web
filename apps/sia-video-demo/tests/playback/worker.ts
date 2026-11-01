/** Keeps the packaged worker and media pipeline, replacing only payload transport. */
import { installSiaVideoSourceWorker } from "@lumeweb/sia-video-source/worker/setup";
import { createRemoteMockSdk } from "@lumeweb/sia-testing/sdk";

installSiaVideoSourceWorker({
  createSdk: (config, _appSeed, sharingSeed) => {
    if (!config)
      throw new Error("The demo fixture needs its local network URL");
    const sdk = createRemoteMockSdk({
      client: "reader",
      url: config.indexerUrl,
    });
    return Promise.resolve({
      ...sdk,
      objectFromSharedKey: (key: string) => {
        if (!sharingSeed)
          return Promise.reject(
            new Error("The shared source needs its encrypted seed"),
          );
        return sdk.object(key);
      },
    });
  },
});
