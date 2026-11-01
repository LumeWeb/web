/** Probe identities and abort ownership prevent an old load's reply from deciding a new load. */
import { afterEach, expect, test, vi } from "vitest";
import { createHostMseProbe } from "../capabilities/host-mse-probe.ts";
import {
  isMainToWorkerMessage,
  isWorkerToMainMessage,
  MainToWorkerMessageType,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from "../protocol.ts";

afterEach(() => vi.useRealTimers());

function fixture() {
  const messages: WorkerToMainMessage[] = [];
  const probe = createHostMseProbe((message) => messages.push(message));
  const signal = new AbortController();
  return { messages, probe, signal };
}

test("only the matching query and load can resolve a MIME check", async () => {
  vi.useFakeTimers();
  const { messages, probe, signal } = fixture();
  let settled = false;
  const pending = probe
    .supported("video/mp4", 7, signal.signal)
    .then((value) => {
      settled = true;
      return value;
    });
  expect(messages).toMatchObject([
    {
      mime: "video/mp4",
      queryId: 1,
      requestId: 7,
      type: WorkerToMainMessageType.MSE_QUERY,
    },
  ]);
  probe.receive({
    queryId: 1,
    requestId: 8,
    supported: true,
    type: MainToWorkerMessageType.MSE_RESULT,
  });
  probe.receive({
    queryId: 2,
    requestId: 7,
    supported: true,
    type: MainToWorkerMessageType.MSE_RESULT,
  });
  await Promise.resolve();
  expect(settled).toBe(false);
  probe.receive({
    queryId: 1,
    requestId: 7,
    supported: false,
    type: MainToWorkerMessageType.MSE_RESULT,
  });
  expect(await pending).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});

test("an aborted query cannot resolve its replacement", async () => {
  vi.useFakeTimers();
  const { probe, signal } = fixture();
  const first = probe
    .supported("video/mp4", 7, signal.signal)
    .catch((error: unknown) => error);
  signal.abort();
  expect(await first).toMatchObject({ name: "AbortError" });
  expect(vi.getTimerCount()).toBe(0);
  let settled = false;
  const replacement = new AbortController();
  const second = probe
    .supported("video/webm", 8, replacement.signal)
    .then((value) => {
      settled = true;
      return value;
    });
  probe.receive({
    queryId: 1,
    requestId: 8,
    supported: false,
    type: MainToWorkerMessageType.MSE_RESULT,
  });
  await Promise.resolve();
  expect(settled).toBe(false);
  probe.receive({
    queryId: 2,
    requestId: 8,
    supported: true,
    type: MainToWorkerMessageType.MSE_RESULT,
  });
  expect(await second).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
});

test("a closed message channel releases the query timer", async () => {
  vi.useFakeTimers();
  const probe = createHostMseProbe(() => {
    throw new Error("channel closed");
  });
  await expect(
    probe.supported("video/mp4", 7, new AbortController().signal),
  ).rejects.toThrow("channel closed");
  expect(vi.getTimerCount()).toBe(0);
});

test("an already aborted load sends no MIME query", () => {
  const { messages, probe } = fixture();
  expect(() => probe.supported("video/mp4", 7, AbortSignal.abort())).toThrow();
  expect(messages).toEqual([]);
});

test("both MIME message directions accept valid identities", () => {
  expect(
    isWorkerToMainMessage({
      mime: "video/mp4",
      queryId: 1,
      requestId: 7,
      type: WorkerToMainMessageType.MSE_QUERY,
    }),
  ).toBe(true);
  expect(
    isMainToWorkerMessage({
      queryId: 1,
      requestId: 7,
      supported: false,
      type: MainToWorkerMessageType.MSE_RESULT,
    }),
  ).toBe(true);
});

const mutations: [string, (message: Record<string, unknown>) => void][] = [
  [
    "missing query id",
    (message) => {
      delete message.queryId;
    },
  ],
  [
    "zero query id",
    (message) => {
      message.queryId = 0;
    },
  ],
  [
    "fractional query id",
    (message) => {
      message.queryId = 1.5;
    },
  ],
  [
    "unsafe query id",
    (message) => {
      message.queryId = Number.MAX_SAFE_INTEGER + 1;
    },
  ],
  [
    "nonfinite load id",
    (message) => {
      message.requestId = Infinity;
    },
  ],
  [
    "negative load id",
    (message) => {
      message.requestId = -1;
    },
  ],
];
for (const [name, mutate] of mutations) {
  test(`MIME guards reject ${name}`, () => {
    const query: Record<string, unknown> = {
      mime: "video/mp4",
      queryId: 1,
      requestId: 7,
      type: WorkerToMainMessageType.MSE_QUERY,
    };
    const reply: Record<string, unknown> = {
      queryId: 1,
      requestId: 7,
      supported: true,
      type: MainToWorkerMessageType.MSE_RESULT,
    };
    mutate(query);
    mutate(reply);
    expect(isWorkerToMainMessage(query)).toBe(false);
    expect(isMainToWorkerMessage(reply)).toBe(false);
  });
}

test("MIME guards reject empty probes and nonboolean verdicts", () => {
  expect(
    isWorkerToMainMessage({
      mime: "",
      queryId: 1,
      requestId: 7,
      type: WorkerToMainMessageType.MSE_QUERY,
    }),
  ).toBe(false);
  expect(
    isMainToWorkerMessage({
      queryId: 1,
      requestId: 7,
      supported: "true",
      type: MainToWorkerMessageType.MSE_RESULT,
    }),
  ).toBe(false);
});

test("HELLO accepts absent host MSE but rejects an unknown implementation", () => {
  expect(
    isMainToWorkerMessage({
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    }),
  ).toBe(true);
  expect(
    isMainToWorkerMessage({
      hostMse: "standard",
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    }),
  ).toBe(true);
  expect(
    isMainToWorkerMessage({
      hostMse: "unknown",
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    }),
  ).toBe(false);
});
