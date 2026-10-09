/** Verifies transport and main-thread media resource invariants. */
import { describe, expect, it, vi } from "vitest";
import {
  type MseCtorLike,
  mseImplementation,
} from "../capabilities/mse-runtime.ts";
import { type LogFields, type Logger } from "../log/logger.ts";
import {
  MediaWorkerBackend,
  type MediaWorkerBackendMseState,
} from "../media-worker-backend.ts";
import { type MseAppendPipe } from "../mse-pipe.ts";
import { MainToWorkerMessageType, workerMode } from "../protocol.ts";

/** Runs only in a real browser with a `MediaSource` API (both Playwright projects). */
const IN_BROWSER =
  typeof document !== "undefined" && typeof MediaSource !== "undefined";

/** Scriptable `MediaSource` stand-in: ready state, the `duration` write, and the `addSourceBuffer` result. */
function fakeMediaSource(
  readyState: MediaSource["readyState"],
  addSourceBuffer: (mime: string) => unknown,
) {
  return {
    addSourceBuffer: (mime: string) => addSourceBuffer(mime),
    duration: 0,
    readyState,
  };
}

/** Scriptable `SourceBuffer` stand-in: captures the `updateend` listener. */
function fakeSourceBuffer() {
  const buffer = {
    addEventListener(type: string, listener: () => void): void {
      if (type === "updateend") buffer.updateEnd = listener;
    },
    updateEnd: null as (() => void) | null,
  };
  return buffer;
}

/** Records `info`/`error` calls (the two severities the setup emits); the rest are no-ops. */
function recordingLogger() {
  const lines: { fields?: LogFields; level: "error" | "info"; name: string }[] =
    [];
  const logger: Logger = {
    child: () => logger,
    debug: () => undefined,
    error: (name, fields) => lines.push({ fields, level: "error", name }),
    info: (name, fields) => lines.push({ fields, level: "info", name }),
    level: "debug",
    trace: () => undefined,
    warn: () => undefined,
  };
  return { lines, logger };
}

describe("MediaWorkerBackend outbound transport", () => {
  it("queues SEEK until the worker session is ready", () => {
    const { logger } = recordingLogger();
    const posted: unknown[] = [];
    const worker = {
      addEventListener: () => undefined,
      postMessage: (message: unknown) => posted.push(message),
      removeEventListener: () => undefined,
      terminate: () => undefined,
    } as unknown as Worker;
    const backend = new MediaWorkerBackend({
      createWorker: () => worker,
      logger,
      onChunkAppend: () => undefined,
      onChunkProgress: () => undefined,
      onDecodeFailure: () => undefined,
      onSourceBuffer: () => undefined,
      onSourceBufferUpdated: () => undefined,
    });
    backend.spawn();
    const seek = {
      requestId: 1,
      time: 4,
      type: MainToWorkerMessageType.SEEK,
    } as const;
    backend.send(seek);
    expect(posted).toEqual([]);
    expect(backend.markReady()).toEqual([seek]);
  });

  it("drops PLAYHEAD while the worker session is not ready", () => {
    const { logger } = recordingLogger();
    const posted: unknown[] = [];
    const worker = {
      addEventListener: () => undefined,
      postMessage: (message: unknown) => posted.push(message),
      removeEventListener: () => undefined,
      terminate: () => undefined,
    } as unknown as Worker;
    const backend = new MediaWorkerBackend({
      createWorker: () => worker,
      logger,
      onDecodeFailure: () => undefined,
      onSourceBuffer: () => undefined,
      onSourceBufferUpdated: () => undefined,
    });
    backend.spawn();
    backend.send({
      requestId: 1,
      time: 4,
      type: MainToWorkerMessageType.PLAYHEAD,
    });
    expect(backend.markReady()).toEqual([]);
    expect(posted).toEqual([]);
  });
});

describe("MediaWorkerBackend main-thread SourceBuffer setup", () => {
  it("reuses the live append pipe when setup is repeated", () => {
    const { logger } = recordingLogger();
    const backend = new MediaWorkerBackend({
      logger,
      onDecodeFailure: () => undefined,
      onSourceBuffer: () => undefined,
      onSourceBufferUpdated: () => undefined,
    });
    const options = {
      getMediaSource: () => null,
      getPlayheadSeconds: () => 0,
      getSourceBuffer: () => null,
    };

    const first = backend.createAppendPipe(options);
    const second = backend.createAppendPipe(options);

    expect(second).toBe(first);
  });

  it("resets the load pipeline in revoke → abort → clear order", () => {
    const { logger } = recordingLogger();
    const steps: string[] = [];
    const pipe = { abort: () => steps.push("abort") };
    let objectUrl: null | string = "blob:old";
    let appendPipe: unknown = pipe;
    const state: MediaWorkerBackendMseState = {
      getAppendPipe: () => appendPipe as MseAppendPipe | null,
      getObjectUrl: () => objectUrl,
      setAppendPipe: (value) => {
        steps.push("clear-pipe");
        appendPipe = value;
      },
      setMediaSource: () => steps.push("clear-media-source"),
      setObjectUrl: (value) => {
        steps.push("clear-url");
        objectUrl = value;
      },
      setSourceBuffer: () => steps.push("clear-source-buffer"),
    };
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => steps.push("revoke"));
    try {
      new MediaWorkerBackend({
        logger,
        onDecodeFailure: () => undefined,
        onSourceBuffer: () => undefined,
        onSourceBufferUpdated: () => undefined,
      }).resetMainThreadMse(state);
      expect(steps).toEqual([
        "revoke",
        "clear-url",
        "abort",
        "clear-pipe",
        "clear-media-source",
        "clear-source-buffer",
      ]);
      expect(objectUrl).toBeNull();
      expect(appendPipe).toBeNull();
    } finally {
      revoke.mockRestore();
    }
  });

  it("destroys the main-thread MSE pipeline in abort → revoke → clear order", () => {
    const { logger } = recordingLogger();
    const steps: string[] = [];
    const pipe = { abort: () => steps.push("abort") };
    let objectUrl: null | string = "blob:destroyed";
    let appendPipe: unknown = pipe;
    const state: MediaWorkerBackendMseState = {
      getAppendPipe: () => appendPipe as MseAppendPipe | null,
      getObjectUrl: () => objectUrl,
      setAppendPipe: (value) => {
        steps.push("clear-pipe");
        appendPipe = value;
      },
      setMediaSource: () => steps.push("clear-media-source"),
      setObjectUrl: (value) => {
        steps.push("clear-url");
        objectUrl = value;
      },
      setSourceBuffer: () => steps.push("clear-source-buffer"),
    };
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => steps.push("revoke"));
    try {
      new MediaWorkerBackend({
        logger,
        onDecodeFailure: () => undefined,
        onSourceBuffer: () => undefined,
        onSourceBufferUpdated: () => undefined,
      }).destroyMainThreadMse(state);
      expect(steps).toEqual([
        "abort",
        "clear-pipe",
        "revoke",
        "clear-url",
        "clear-media-source",
        "clear-source-buffer",
      ]);
      expect(objectUrl).toBeNull();
      expect(appendPipe).toBeNull();
    } finally {
      revoke.mockRestore();
    }
  });

  it("reports a decode failure when the MIME is refused", () => {
    const { lines, logger } = recordingLogger();
    const steps: string[] = [];
    const sourceBuffer = fakeSourceBuffer();
    const addSourceBuffer = vi.fn((mime: string) => {
      if (mime.includes("refused")) throw new Error("refused MIME");
      return sourceBuffer;
    });
    const backend = new MediaWorkerBackend({
      logger,
      onDecodeFailure: (error) =>
        steps.push(`decode:${(error as Error).message}`),
      onSourceBuffer: (stored) => {
        expect(stored).toBe(sourceBuffer);
        steps.push("store");
      },
      onSourceBufferUpdated: () => {
        steps.push("kick");
        steps.push("report");
      },
    });

    // A not-yet-open MediaSource is left alone: no attempt, no log, no glue.
    const notOpen = fakeMediaSource("closed", addSourceBuffer);
    backend.attachSourceBuffer(
      notOpen as unknown as MediaSource,
      "video/mp4",
      null,
    );
    expect(addSourceBuffer).not.toHaveBeenCalled();
    expect(notOpen.duration).toBe(0);
    expect(lines).toHaveLength(0);
    expect(steps).toHaveLength(0);

    // The open source: duration set, one buffer for the load's MIME, and the
    // glue in the exact callback order (store → kick → report → log).
    const open = fakeMediaSource("open", addSourceBuffer);
    backend.attachSourceBuffer(
      open as unknown as MediaSource,
      'video/mp4; codecs="avc1.4d401f"',
      42.5,
    );
    expect(open.duration).toBe(42.5);
    expect(addSourceBuffer).toHaveBeenCalledTimes(1);
    expect(addSourceBuffer).toHaveBeenCalledWith(
      'video/mp4; codecs="avc1.4d401f"',
    );
    expect(steps).toEqual(["store", "kick", "report"]);
    expect(lines).toEqual([
      {
        fields: {
          durationSeconds: 42.5,
          mime: 'video/mp4; codecs="avc1.4d401f"',
        },
        level: "info",
        name: "mse-open",
      },
    ]);

    // Every real `updateend` re-runs kick → report, in that order.
    sourceBuffer.updateEnd?.();
    expect(steps).toEqual(["store", "kick", "report", "kick", "report"]);
    expect(lines).toHaveLength(1);

    // A refused MIME: no store/kick/report for the failed attempt, the MIME
    // is named in `mse-open-failed`, and the raw error is escalated. The
    // `null` duration also proves no `duration` write on a failed setup.
    const refused = fakeMediaSource("open", addSourceBuffer);
    backend.attachSourceBuffer(
      refused as unknown as MediaSource,
      "video/refused",
      null,
    );
    expect(refused.duration).toBe(0);
    expect(steps).toEqual([
      "store",
      "kick",
      "report",
      "kick",
      "report",
      "decode:refused MIME",
    ]);
    expect(lines).toEqual([
      {
        fields: {
          durationSeconds: 42.5,
          mime: 'video/mp4; codecs="avc1.4d401f"',
        },
        level: "info",
        name: "mse-open",
      },
      {
        fields: { mime: "video/refused" },
        level: "error",
        name: "mse-open-failed",
      },
    ]);
  });
});

/** Polls `probe` on a ~16ms timer until it returns true or the deadline expires. */
async function waitFor(
  probe: () => boolean,
  timeoutMs = 20_000,
): Promise<void> {
  const startedAt = Date.now();
  while (!probe()) {
    if (Date.now() - startedAt > timeoutMs)
      throw new Error("waitFor timed out");
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
}

/** Attaches a MediaSource and returns the URL assigned to the video element. */
describe.skipIf(!IN_BROWSER)("MediaWorkerBackend object-URL attach", () => {
  it("creates the object URL, prepares the element, assigns it to the element, and returns it", async () => {
    const { logger } = recordingLogger();
    const backend = new MediaWorkerBackend({
      logger,
      onDecodeFailure: () => undefined,
      onSourceBuffer: () => undefined,
      onSourceBufferUpdated: () => undefined,
    });
    // The `<video>` is what opens the MediaSource: `sourceopen` never fires
    // for an unattached one, so a real attach is observable as the ready
    // state moving to `open` — in both configured browser projects.
    const video = document.createElement("video");
    video.playsInline = true;
    document.body.appendChild(video);
    const mediaSource = new MediaSource();
    expect(mediaSource.readyState).toBe("closed");
    const objectUrl = backend.attachObjectUrl(
      mediaSource,
      video,
      mseImplementation.standard,
    );
    try {
      // The backend returns the URL it created, and it is exactly the one
      // the element now carries (the host stores the return value as-is).
      expect(objectUrl).toMatch(/^blob:/);
      expect(video.src).toBe(objectUrl);
      await waitFor(() => mediaSource.readyState === "open");
      expect(mediaSource.readyState).toBe("open");
    } finally {
      video.remove();
      URL.revokeObjectURL(objectUrl);
    }
  }, 30_000);
});

// the `MediaSource` construction and the open-state gate (run the
/** Runs SourceBuffer setup immediately when open and after sourceopen otherwise. */
describe("MediaWorkerBackend MediaSource construction", () => {
  // Scriptable `MediaSource` stand-in: ready state, the `addSourceBuffer`
  // result, and a `sourceopen` listener registry the test can fire.
  function scriptableMediaSource(readyState: MediaSource["readyState"]) {
    const listeners: Record<
      string,
      { listener: () => void; options?: { once?: boolean } }[]
    > = {};
    const fake = {
      addEventListener: (
        type: string,
        listener: () => void,
        options?: { once?: boolean },
      ) => {
        (listeners[type] ??= []).push({ listener, options });
      },
      addSourceBuffer: vi.fn(),
      duration: 0,
      fire(type: string): void {
        // A real MediaSource has moved to `open` before `sourceopen` listeners run.
        if (type === "sourceopen") fake.readyState = "open";
        for (const entry of listeners[type] ?? []) entry.listener();
      },
      listeners,
      readyState,
    };
    return fake;
  }

  // Wraps an instance as the runtime's `MediaSource` constructor (a plain
  // function, not an arrow — `new` needs `[[Construct]]`).
  function ctorOf(instance: unknown): MseCtorLike {
    return function (this: unknown) {
      return instance;
    } as unknown as MseCtorLike;
  }

  it("defers SourceBuffer setup until sourceopen when the MediaSource is closed", () => {
    const { lines, logger } = recordingLogger();
    const steps: string[] = [];
    const sourceBuffer = fakeSourceBuffer();
    const open = scriptableMediaSource("open");
    open.addSourceBuffer.mockImplementation(() => sourceBuffer);
    const closed = scriptableMediaSource("closed");
    closed.addSourceBuffer.mockImplementation(() => sourceBuffer);
    const backend = new MediaWorkerBackend({
      logger,
      onDecodeFailure: (error) =>
        steps.push(`decode:${(error as Error).message}`),
      onSourceBuffer: (stored) => {
        expect(stored).toBe(sourceBuffer);
        steps.push("store");
      },
      onSourceBufferUpdated: () => {
        steps.push("kick");
        steps.push("report");
      },
    });

    // Immediate-open: constructed through the runtime's constructor, handed
    // back to the host, and the SourceBuffer setup runs right away — no
    // sourceopen listener needed, in the store → kick → report → log order.
    const returnedOpen = backend.beginMse(
      'video/mp4; codecs="avc1.4d401f"',
      42.5,
      { MediaSource: ctorOf(open) },
    );
    expect(returnedOpen).toBe(open);
    expect(open.addSourceBuffer).toHaveBeenCalledTimes(1);
    expect(open.addSourceBuffer).toHaveBeenCalledWith(
      'video/mp4; codecs="avc1.4d401f"',
    );
    expect(open.duration).toBe(42.5);
    expect(open.listeners.sourceopen).toBeUndefined();
    expect(steps).toEqual(["store", "kick", "report"]);
    expect(lines).toEqual([
      {
        fields: {
          durationSeconds: 42.5,
          mime: 'video/mp4; codecs="avc1.4d401f"',
        },
        level: "info",
        name: "mse-open",
      },
    ]);

    // Deferred: a closed MediaSource gets a once sourceopen listener and no
    // setup yet; firing the event runs the setup exactly once, with no
    // duration write (the load has none).
    const returnedClosed = backend.beginMse(
      'video/mp4; codecs="avc1.64001e"',
      null,
      { MediaSource: ctorOf(closed) },
    );
    expect(returnedClosed).toBe(closed);
    expect(closed.addSourceBuffer).not.toHaveBeenCalled();
    expect(closed.listeners.sourceopen).toHaveLength(1);
    expect(closed.listeners.sourceopen?.[0]?.options).toEqual({ once: true });
    closed.fire("sourceopen");
    expect(closed.addSourceBuffer).toHaveBeenCalledTimes(1);
    expect(closed.addSourceBuffer).toHaveBeenCalledWith(
      'video/mp4; codecs="avc1.64001e"',
    );
    expect(closed.duration).toBe(0);
    expect(steps).toEqual([
      "store",
      "kick",
      "report",
      "store",
      "kick",
      "report",
    ]);
    expect(lines).toEqual([
      {
        fields: {
          durationSeconds: 42.5,
          mime: 'video/mp4; codecs="avc1.4d401f"',
        },
        level: "info",
        name: "mse-open",
      },
      {
        fields: { mime: 'video/mp4; codecs="avc1.64001e"' },
        level: "info",
        name: "mse-open",
      },
    ]);
  });
});

/** Routes chunks according to the active worker mode. */
describe("MediaWorkerBackend CHUNK routing", () => {
  function routeChunkBackend(steps: string[]) {
    const { logger } = recordingLogger();
    return new MediaWorkerBackend({
      logger,
      onChunkAppend: (bytes) => steps.push(`append:${bytes.byteLength}`),
      onChunkProgress: () => steps.push("progress"),
      onDecodeFailure: () => undefined,
      onSourceBuffer: () => undefined,
      onSourceBufferUpdated: () => undefined,
    });
  }

  it("routes non-main chunks to progress", () => {
    const steps: string[] = [];
    const backend = routeChunkBackend(steps);

    // Main mode: the chunk is appended to the host's append pipe.
    backend.routeChunk(workerMode.main, new Uint8Array([1, 2, 3]));
    expect(steps).toEqual(["append:3"]);

    // Worker mode: the chunk is a progress tick, never appended.
    backend.routeChunk(workerMode.worker, new Uint8Array([1, 2, 3]));
    expect(steps).toEqual(["append:3", "progress"]);

    // Unknown mode follows the progress path.
    backend.routeChunk(null, new Uint8Array([1, 2, 3]));
    expect(steps).toEqual(["append:3", "progress", "progress"]);
  });
});

describe("MediaWorkerBackend worker listener lifecycle", () => {
  /** Scriptable Worker recording every listener registration/removal by event type. */
  function fakeWorker() {
    const added: string[] = [];
    const removed: string[] = [];
    const listeners = new Map<string, (event: unknown) => void>();
    let terminated = false;
    const worker = {
      addEventListener(type: string, listener: (event: unknown) => void): void {
        added.push(type);
        listeners.set(type, listener);
      },
      postMessage: () => undefined,
      removeEventListener(type: string): void {
        removed.push(type);
        listeners.delete(type);
      },
      terminate(): void {
        terminated = true;
      },
    };
    return { added, listeners, removed, terminated: () => terminated, worker };
  }

  const noopGlue = {
    onChunkAppend: () => undefined,
    onChunkProgress: () => undefined,
    onDecodeFailure: () => undefined,
    onSourceBuffer: () => undefined,
    onSourceBufferUpdated: () => undefined,
  };

  it("spawn registers exactly the message, error, and messageerror listeners on the owned worker", () => {
    const fake = fakeWorker();
    const { logger } = recordingLogger();
    const backend = new MediaWorkerBackend({
      ...noopGlue,
      createWorker: () => fake.worker as unknown as Worker,
      logger,
    });
    backend.spawn();
    expect([...fake.added].sort()).toEqual([
      "error",
      "message",
      "messageerror",
    ]);
  });

  it("routes each inbound worker event to its typed host callback", () => {
    const fake = fakeWorker();
    const { logger } = recordingLogger();
    const seen: string[] = [];
    const backend = new MediaWorkerBackend({
      ...noopGlue,
      createWorker: () => fake.worker as unknown as Worker,
      logger,
      onError: () => seen.push("error"),
      onMessage: () => seen.push("message"),
      onMessageError: () => seen.push("messageerror"),
    });
    backend.spawn();
    fake.listeners.get("message")?.({ data: { type: "chunk" } });
    fake.listeners.get("error")?.({ message: "boom" });
    fake.listeners.get("messageerror")?.({});
    expect(seen).toEqual(["message", "error", "messageerror"]);
  });

  it("terminate removes exactly the registered listeners and terminates the owned worker", () => {
    const fake = fakeWorker();
    const { logger } = recordingLogger();
    const backend = new MediaWorkerBackend({
      ...noopGlue,
      createWorker: () => fake.worker as unknown as Worker,
      logger,
      onError: () => undefined,
      onMessage: () => undefined,
      onMessageError: () => undefined,
    });
    const worker = backend.spawn();
    backend.terminate();
    expect([...fake.removed].sort()).toEqual([
      "error",
      "message",
      "messageerror",
    ]);
    expect(fake.listeners.size).toBe(0);
    expect(fake.terminated()).toBe(true);
    expect(backend.worker).toBeNull();
    // A later dispatch on the removed listeners is impossible: the backend
    // dropped the handle, and a second spawn re-registers cleanly.
    expect(() => backend.terminate()).not.toThrow();
    expect(worker).toBe(fake.worker);
  });

  it("missing typed callbacks default to no-ops: dispatching never throws", () => {
    const fake = fakeWorker();
    const { logger } = recordingLogger();
    const backend = new MediaWorkerBackend({
      ...noopGlue,
      createWorker: () => fake.worker as unknown as Worker,
      logger,
    });
    backend.spawn();
    expect(() => {
      fake.listeners.get("message")?.({ data: { type: "chunk" } });
      fake.listeners.get("error")?.({ message: "boom" });
      fake.listeners.get("messageerror")?.({});
    }).not.toThrow();
    backend.terminate();
  });
});
