import { describe, expect, it, vi } from "vitest";
import { nullLogger } from "../log/logger.ts";
import { type SiaNativeStreamProvider } from "../native-stream-provider.ts";
import { SIA_PLAYBACK_BACKENDS } from "../playback-backend.ts";
import {
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from "../protocol.ts";
import { SiaVideoSource } from "../sia-video-source.ts";

class FakeVideoTarget extends EventTarget {
  currentTime = 0;
  paused = true;
  play = vi.fn(() => Promise.resolve());
  src = "";
  getAttribute(): null {
    return null;
  }
  removeAttribute(): void {
    this.src = "";
  }
}

class FakeWorker {
  listener: ((event: { data: unknown }) => void) | null = null;
  readonly sent: MainToWorkerMessage[] = [];
  terminated = false;

  addEventListener(
    _type: "message",
    listener: (event: { data: unknown }) => void,
  ): void {
    this.listener = listener;
  }
  postMessage(message: unknown): void {
    this.sent.push(message as MainToWorkerMessage);
  }
  removeEventListener(): void {
    this.listener = null;
  }
  reply(message: WorkerToMainMessage): void {
    this.listener?.({ data: message });
  }
  terminate(): void {
    this.terminated = true;
  }
}

function replyToWorkerHandshake(worker: FakeWorker): void {
  const hello = worker.sent.findLast(
    (message) => message.type === MainToWorkerMessageType.HELLO,
  );
  if (!hello || !("requestId" in hello)) throw new Error("HELLO was not sent");
  worker.reply({
    features: { workerMse: false },
    publicKey: new Uint8Array(32),
    requestId: hello.requestId,
    type: WorkerToMainMessageType.HELLO_OK,
    version: PROTOCOL_VERSION,
  });
  const attach = worker.sent.findLast(
    (message) => message.type === MainToWorkerMessageType.ATTACH,
  );
  if (!attach || !("requestId" in attach))
    throw new Error("ATTACH was not sent");
  worker.reply({
    mode: "main",
    requestId: attach.requestId,
    type: WorkerToMainMessageType.ATTACH_OK,
  });
}

const flush = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

const HAS_BROWSER_MSE =
  typeof document !== "undefined" && typeof MediaSource !== "undefined";

function provider(available: boolean): SiaNativeStreamProvider {
  return {
    available: () => Promise.resolve(available),
    open: (src) =>
      Promise.resolve({
        release: () => undefined,
        url: `https://stream.example/${src}`,
      }),
  };
}

describe("auto backend selection", () => {
  it("uses the native stream when the provider reports availability", async () => {
    const createWorker = vi.fn();
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(true),
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "object-key";
    await flush();

    expect(createWorker).not.toHaveBeenCalled();
    expect(target.src).toBe("https://stream.example/object-key");
    host.destroy();
  });

  it("falls back once when native setup fails and keeps source and play intent", async () => {
    const worker = new FakeWorker();
    const createWorker = vi.fn(() => worker);
    const target = new FakeVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(true),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "setup-failure-key";
    await flush();
    expect(createWorker).toHaveBeenCalledOnce();
    replyToWorkerHandshake(worker);
    await flush();

    expect(host.src).toBe("setup-failure-key");
    if (typeof MediaSource !== "undefined") {
      expect(
        worker.sent.findLast(
          (message) => message.type === MainToWorkerMessageType.SOURCE,
        ),
      ).toMatchObject({
        src: "setup-failure-key",
        type: MainToWorkerMessageType.SOURCE,
      });
    }
    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("falls back once when the native element reports duplicate errors", async () => {
    const worker = new FakeWorker();
    const createWorker = vi.fn(() => worker);
    const target = new FakeVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(true),
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "element-failure-key";
    await flush();
    expect(target.src).toBe("https://stream.example/element-failure-key");
    target.dispatchEvent(new Event("error"));
    target.dispatchEvent(new Event("error"));
    await flush();

    expect(createWorker).toHaveBeenCalledOnce();
    replyToWorkerHandshake(worker);
    await flush();
    expect(host.src).toBe("element-failure-key");
    if (typeof MediaSource !== "undefined") {
      expect(
        worker.sent.findLast(
          (message) => message.type === MainToWorkerMessageType.SOURCE,
        ),
      ).toMatchObject({ src: "element-failure-key" });
    }
    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("does not fall back when service-worker playback is forced", async () => {
    const createWorker = vi.fn();
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.SERVICE_WORKER,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(true),
        open: () => Promise.reject(new Error("forced native failure")),
      },
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "forced-failure-key";
    await flush();

    expect(createWorker).not.toHaveBeenCalled();
    expect(target.src).toBe("");
    host.destroy();
  });

  it("re-handshakes an existing worker when AUTO has no native provider", async () => {
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "reattach-key";
    await flush();
    replyToWorkerHandshake(worker);
    await flush();
    const sourceCount = worker.sent.filter(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    ).length;
    const helloCount = worker.sent.filter(
      (message) => message.type === MainToWorkerMessageType.HELLO,
    ).length;

    const replacement = new FakeVideoTarget();
    host.attach(replacement as unknown as HTMLVideoElement);
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.HELLO,
      ),
    ).toHaveLength(helloCount + 1);
    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toHaveLength(sourceCount);
    replyToWorkerHandshake(worker);
    await flush();
    if (HAS_BROWSER_MSE) {
      expect(
        worker.sent.filter(
          (message) => message.type === MainToWorkerMessageType.SOURCE,
        ),
      ).toHaveLength(sourceCount + 1);
    }
    host.destroy();
  });

  it("tears down the worker before AUTO switches to an available native stream", async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(false),
    });
    const target = new FakeVideoTarget();
    host.attach(target as unknown as HTMLVideoElement);
    host.src = "transition-key";
    await flush();
    replyToWorkerHandshake(worker);
    await flush();

    host.nativeStreamProvider = provider(true);
    await flush();
    await flush();
    await flush();
    await flush();

    expect(worker.terminated).toBe(true);
    expect(target.src).toBe("https://stream.example/transition-key");
    host.destroy();
  });

  it("uses the media worker when the provider reports unavailability", async () => {
    const createWorker = vi.fn(() => ({
      addEventListener: () => undefined,
      postMessage: () => undefined,
      removeEventListener: () => undefined,
      terminate: () => undefined,
    }));
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(false),
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "object-key";
    await flush();

    expect(createWorker).toHaveBeenCalledOnce();
    expect(target.src).toBe("");
    host.destroy();
  });
});
