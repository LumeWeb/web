/** Keeps playback, decoding and worker communication real while the fixture supplies stored bytes. */
import {
  createSiaNativeStreamProvider,
  isWorkerToMainMessage,
  MainToWorkerMessageType,
  nullLogger,
  type SiaPlaybackBackend,
  siaSourceInfoChange,
  type SiaSourceInfoChangeDetail,
  SiaVideoSource,
  WorkerToMainMessageType,
} from "@lumeweb/sia-video-source";
import { createRemoteMockSdk } from "@lumeweb/sia-testing/sdk";

const query = new URL(location.href).searchParams;
const endpoint = query.get("network");
if (!endpoint) throw new Error("Mock network URL is required");
const video = document.querySelector("video")!;
let sourceKind: "native" | "worker" | null = null;
video.addEventListener(siaSourceInfoChange, (event) => {
  const detail = (event as CustomEvent<SiaSourceInfoChangeDetail>).detail;
  sourceKind = detail.active ? detail.kind : null;
});
const events: { paused: boolean; type: string }[] = [];
for (const type of [
  "play",
  "playing",
  "pause",
  "emptied",
  "loadedmetadata",
  "error",
]) {
  video.addEventListener(type, () => {
    events.push({ paused: video.paused, type });
    if (events.length > 64) events.shift();
  });
}
let frames = 0;
let frameTime = 0;
let frameCallback = 0;
const decoded: VideoFrameRequestCallback = (_now, metadata) => {
  frames++;
  frameTime = metadata.mediaTime;
  frameCallback = video.requestVideoFrameCallback(decoded);
};
frameCallback = video.requestVideoFrameCallback(decoded);
let nativeReleases = 0;
const nativeSdk = createRemoteMockSdk({ client: "reader", url: endpoint });
const nativeProvider = createSiaNativeStreamProvider({
  capability: () => Promise.resolve(query.get("nativeAvailable") !== "false"),
  createStreamSession: () => ({
    url: () =>
      Promise.resolve({
        release() {
          nativeReleases++;
        },
        url:
          query.get("nativeURL") ??
          new URL(
            "../../src/__fixtures__/media/browser-decodable-avc-aac.mp4",
            import.meta.url,
          ).href,
      }),
  }),
  resolveSource: (src) => {
    if (src !== "2".repeat(64))
      throw new Error("Native fixture object not found");
    return nativeSdk.object(src);
  },
});
const source = new SiaVideoSource({
  backend: (query.get("backend") ?? "media-worker") as SiaPlaybackBackend,
  createWorker: () =>
    new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
  logger: nullLogger,
  nativeStreamProvider: nativeProvider,
  workerConfig: {
    app: {
      appId: "mock-playback",
      callbackUrl: "",
      description: "",
      logoUrl: "",
      name: "Playback fixture",
      serviceUrl: location.origin,
    },
    indexerUrl: endpoint,
  },
  workerMse: query.get("mse") === "main" ? "main" : "auto",
});
source.attach(video);

export const playback = {
  async defaultHandshake() {
    const worker = new Worker(new URL("./default-worker.ts", import.meta.url), {
      type: "module",
    });
    try {
      return await new Promise<{ publicKeyBytes: number; requestId: number }>(
        (resolve, reject) => {
          worker.onerror = (event) => reject(new Error(event.message));
          worker.onmessage = (event: MessageEvent<unknown>) => {
            if (
              isWorkerToMainMessage(event.data) &&
              event.data.type === WorkerToMainMessageType.HELLO_OK
            ) {
              resolve({
                publicKeyBytes: event.data.publicKey.byteLength,
                requestId: event.data.requestId,
              });
            }
          };
          worker.postMessage({
            requestId: 73,
            type: MainToWorkerMessageType.HELLO,
          });
        },
      );
    } finally {
      worker.terminate();
    }
  },
  destroy() {
    source.destroy();
    video.cancelVideoFrameCallback(frameCallback);
  },
  load(id: string) {
    source.src = id;
    // Replacement aborts native play promises; the host error state remains the failure signal.
    void source.play().catch(() => undefined);
  },
  pause() {
    source.pause();
  },
  seek(seconds: number) {
    source.currentTime = seconds;
  },
  snapshot() {
    return {
      bufferedEnd: video.buffered.length
        ? video.buffered.end(video.buffered.length - 1)
        : 0,
      currentTime: video.currentTime,
      duration: video.duration,
      error: source.error?.message ?? video.error?.message ?? null,
      errorCode: source.error?.code ?? video.error?.code ?? null,
      events,
      frames,
      frameTime,
      hasWorker: source.engine !== null,
      height: video.videoHeight,
      nativeReleases,
      paused: video.paused,
      readyState: video.readyState,
      sourceKind,
      width: video.videoWidth,
      workerMse: video.srcObject !== null,
    };
  },
};
declare global {
  interface Window {
    playback: typeof playback;
  }
}
window.playback = playback;
