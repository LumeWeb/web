/** Keeps real inspection and conversion while injecting opening read failures on request. */
import { installSiaVideoSourceWorker } from "@lumeweb/sia-video-source/worker/setup";
import { createMockPlaybackSdk } from "@lumeweb/sia-video-source/testing/reader";

const failuresByObject = new Map<string, number>();

installSiaVideoSourceWorker({
  createSdk(config, appSeed, sharingSeed) {
    if (!config) throw new Error("Playback tests require a scoped reader URL");
    const sdk = createMockPlaybackSdk(config.indexerUrl, appSeed, sharingSeed);
    const query = new URL(config.indexerUrl).searchParams;
    const failure = query.get("openingFailure");
    return Promise.resolve({
      ...sdk,
      download(object, range) {
        const id = object.id();
        const attempts = failuresByObject.get(id) ?? 0;
        if (id === query.get("failedObject") && attempts < Number(query.get("failedOpenings") ?? Infinity)) {
          failuresByObject.set(id, attempts + 1);
          if (failure === "shard-shortage") throw new Error("not enough shards: 0/10");
          if (failure === "read-stalled") return Promise.resolve(new ReadableStream<Uint8Array>());
        }
        return sdk.download(object, range);
      },
    });
  },
});
