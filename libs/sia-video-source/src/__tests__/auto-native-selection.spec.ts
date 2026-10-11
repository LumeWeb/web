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
  pause = vi.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  play = vi.fn(() => {
    this.paused = false;
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  src = "";
  getAttribute(): null {
    return null;
  }
  removeAttribute(): void {
    this.src = "";
  }
}

class AsyncPauseVideoTarget extends FakeVideoTarget {
  override pause = vi.fn(() => {
    this.paused = true;
    setTimeout(() => this.dispatchEvent(new Event("pause")), 0);
  });
}

class DelayedPlayVideoTarget extends FakeVideoTarget {
  readonly pendingPlays: {
    reject: (reason?: unknown) => void;
    resolve: () => void;
  }[] = [];
  override pause = vi.fn(() => {
    this.paused = true;
    const pending = this.pendingPlays.splice(0);
    for (const { reject } of pending)
      reject(
        new DOMException("The play() request was interrupted", "AbortError"),
      );
    this.dispatchEvent(new Event("pause"));
  });

  override play = vi.fn(() => {
    this.paused = false;
    return new Promise<void>((resolve, reject) => {
      this.pendingPlays.push({ reject, resolve });
    });
  });

  resolveNextPlay(): void {
    const pending = this.pendingPlays.shift();
    if (!pending) return;
    this.dispatchEvent(new Event("play"));
    pending.resolve();
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

  it("retains cancellation through an asynchronous native teardown pause", async () => {
    const worker = new FakeWorker();
    const target = new AsyncPauseVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(true),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "async-pause-key";
    void target.play();
    await flush();
    // A later user play must win even when the stale teardown pause arrives
    // afterward, before the replacement worker has completed its handshake.
    void target.play();
    await flush();
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("does not retain cancellation when native teardown was already paused", async () => {
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(true),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "already-paused-key";
    await flush();
    // pause() emits no event for an already-paused native element.
    await flush();
    void target.play();
    target.paused = true;
    target.dispatchEvent(new Event("pause"));
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(0);
    host.destroy();
  });

  it("waits for ATTACH_OK before sending a source when switching from native to the media worker", async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(true),
    });

    host.attach(new FakeVideoTarget() as unknown as HTMLVideoElement);
    host.src = "native-switch-key";
    await flush();

    host.backend = SIA_PLAYBACK_BACKENDS.MEDIA_WORKER;

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toEqual([]);

    replyToWorkerHandshake(worker);

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("waits for ATTACH_OK before sending a source after native availability rejects", async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.reject(new Error("availability failed")),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(new FakeVideoTarget() as unknown as HTMLVideoElement);
    host.src = "availability-failure-key";
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toEqual([]);

    replyToWorkerHandshake(worker);

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("sends no source for a reload issued while the AUTO fallback handshake is pending", async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.reject(new Error("availability failed")),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(new FakeVideoTarget() as unknown as HTMLVideoElement);
    host.src = "reload-pending-key";
    await flush();

    // The fallback worker is spawned and its first handshake is in flight;
    // a reload re-runs the handshake on the same worker.
    host.reloadConfiguration();
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toEqual([]);

    replyToWorkerHandshake(worker);

    const sources = worker.sent.filter(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({ src: "reload-pending-key" });
    host.destroy();
  });

  it("replays only the newest source when src and load are re-applied while the AUTO fallback handshake is pending", async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.reject(new Error("availability failed")),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(new FakeVideoTarget() as unknown as HTMLVideoElement);
    host.src = "reapply-first-key";
    await flush();

    // A re-render re-applies the (changed) source and an explicit load while
    // the fallback handshake is still pending.
    host.src = "reapply-second-key";
    await flush();
    host.load();
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toEqual([]);

    replyToWorkerHandshake(worker);

    const sources = worker.sent.filter(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({ src: "reapply-second-key" });
    host.destroy();
  });

  it("falls back to the media worker without a pre-attach source when the native provider is absent", async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
    });

    host.attach(new FakeVideoTarget() as unknown as HTMLVideoElement);
    host.src = "no-provider-key";
    await flush();

    // Service-worker streaming is unavailable: every re-apply during the
    // pending fallback handshake must stay out of the worker until ATTACH_OK.
    host.load();
    await flush();
    host.reloadConfiguration();
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.SOURCE,
      ),
    ).toEqual([]);

    replyToWorkerHandshake(worker);

    const sources = worker.sent.filter(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({ src: "no-provider-key" });
    host.destroy();
  });

  it("falls back when native availability is rejected and resumes play intent", async () => {
    const worker = new FakeWorker();
    const createWorker = vi.fn(() => worker);
    const target = new FakeVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.reject(new Error("availability failed")),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "availability-failure-key";
    void target.play();
    await flush();

    expect(createWorker).toHaveBeenCalledOnce();
    // The fallback captures the active play intent before tearing down native
    // playback, then resumes it after the replacement HANDLE arrives.
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("does not replay stale play after native availability rejects and pauses during handshake", async () => {
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.reject(new Error("availability failed")),
        open: () => Promise.reject(new Error("native setup failed")),
      },
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "stale-play-key";
    await flush();

    // Simulate the real native resume and then a user pause while the worker
    // handshake is still pending. Both native events must not leave duplicate
    // or stale PLAY intent queued for this replacement load.
    void target.play();
    target.paused = true;
    target.dispatchEvent(new Event("pause"));
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source) {
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    }
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(0);
    host.destroy();
  });

  it("falls back once when native setup fails and resumes play intent", async () => {
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
    void target.play();
    await flush();
    expect(createWorker).toHaveBeenCalledOnce();
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
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

  it("resumes captured play intent when fallback overlaps a delayed native play", async () => {
    const worker = new FakeWorker();
    const target = new DelayedPlayVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(true),
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "delayed-native-play-key";
    await flush();
    // Establish the playing preference through the ordinary user play path;
    // the pending play is followed by its native play event before fallback.
    // The replacement HANDLE must resume this still-active user intent once.
    void target.play();
    target.dispatchEvent(new Event("play"));
    target.dispatchEvent(new Event("error"));
    await flush();
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();
    target.resolveNextPlay();
    target.resolveNextPlay();
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("forwards a legitimate play after an observed play-then-pause transition", async () => {
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(true),
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "play-pause-play-key";
    await flush();

    // Use the actual host lifecycle: an observed native play establishes the
    // prior transition, then a genuine pause settles it before native failure
    // moves the source to the worker backend.
    void target.play();
    target.paused = true;
    target.dispatchEvent(new Event("pause"));
    await flush();
    target.dispatchEvent(new Event("error"));
    await flush();
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();

    // This is a new user transition, not the delayed play from the prior
    // transition. It must produce exactly one worker PLAY.
    void target.play();
    await flush();
    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
    host.destroy();
  });

  it("does not send stale PLAY when delayed native play lands after pause", async () => {
    const worker = new FakeWorker();
    const target = new DelayedPlayVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: provider(true),
    });

    host.attach(target as unknown as HTMLVideoElement);
    host.src = "delayed-stale-native-play-key";
    await flush();
    void target.play();
    target.paused = true;
    target.dispatchEvent(new Event("pause"));
    target.dispatchEvent(new Event("error"));
    await flush();
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();
    target.resolveNextPlay();
    await flush();

    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(0);
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
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
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
    ).toHaveLength(0);
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

  it("reselects the current source when provider readiness changes", async () => {
    let available = false;
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(available),
        open: (src) =>
          Promise.resolve({
            release: () => undefined,
            url: `https://stream.example/${src}`,
          }),
      },
    });
    host.attach(target as unknown as HTMLVideoElement);
    host.src = "readiness-key";
    await flush();
    replyToWorkerHandshake(worker);
    available = true;
    host.reselectBackend();
    await flush();
    await flush();

    expect(target.src).toBe("https://stream.example/readiness-key");
    host.destroy();
  });

  it("does not duplicate stale PLAY when reselection pauses during handshake", async () => {
    let available = true;
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(available),
        open: (src) =>
          Promise.resolve({
            release: () => undefined,
            url: `https://stream.example/${src}`,
          }),
      },
    });
    host.attach(target as unknown as HTMLVideoElement);
    host.src = "reselect-stale-play-key";
    await flush();
    available = false;
    host.reselectBackend();
    await flush();
    await flush();
    void target.play();
    target.paused = true;
    target.dispatchEvent(new Event("pause"));
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();
    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(0);
    host.destroy();
  });

  it("does not resume stale worker playback after pause before native attachment", async () => {
    let resolveOpen!: (result: { release: () => void; url: string }) => void;
    const worker = new FakeWorker();
    const target = new FakeVideoTarget();
    target.paused = false;
    let available = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: vi.fn(() => worker) as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(available),
        open: () =>
          new Promise((resolve) => {
            resolveOpen = (result) => resolve(result);
          }),
      },
    });
    host.attach(target as unknown as HTMLVideoElement);
    host.src = "worker-to-native-pause-key";
    await flush();
    replyToWorkerHandshake(worker);
    available = true;
    void target.play();
    await flush();
    host.reselectBackend();
    await flush();
    target.pause();
    resolveOpen({
      release: () => undefined,
      url: "https://stream.example/worker-to-native-pause-key",
    });
    await flush();

    expect(target.src).toBe(
      "https://stream.example/worker-to-native-pause-key",
    );
    expect(target.play).toHaveBeenCalledTimes(1);
    host.destroy();
  });

  it("resumes play intent when reselection moves native playback to the worker", async () => {
    let available = true;
    const worker = new FakeWorker();
    const createWorker = vi.fn(() => worker);
    const target = new FakeVideoTarget();
    target.paused = false;
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: createWorker as unknown as () => Worker,
      logger: nullLogger,
      nativeStreamProvider: {
        available: () => Promise.resolve(available),
        open: (src) =>
          Promise.resolve({
            release: () => undefined,
            url: `https://stream.example/${src}`,
          }),
      },
    });
    host.attach(target as unknown as HTMLVideoElement);
    host.src = "playing-key";
    await flush();
    expect(target.src).toBe("https://stream.example/playing-key");
    void target.play();
    await flush();

    available = false;
    host.reselectBackend();
    await flush();
    replyToWorkerHandshake(worker);
    const source = worker.sent.findLast(
      (message) => message.type === MainToWorkerMessageType.SOURCE,
    );
    if (source && "requestId" in source)
      worker.reply({
        handle: {},
        requestId: source.requestId,
        type: WorkerToMainMessageType.HANDLE,
      });
    await flush();

    expect(createWorker).toHaveBeenCalledOnce();
    expect(
      worker.sent.filter(
        (message) => message.type === MainToWorkerMessageType.PLAY,
      ),
    ).toHaveLength(1);
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
