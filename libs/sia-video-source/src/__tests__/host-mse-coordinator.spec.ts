/** The real worker composition must use host MIME checks when MSE lives on the main thread. */
import { afterEach, expect, test, vi } from "vitest";
import { detectBrowserCapabilities } from "../capabilities/browser-capabilities.ts";
import {
  MainToWorkerMessageType,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from "../protocol.ts";
import { createSessionCoordinator } from "../session/session-coordinator.ts";
import { MemoryByteSource } from "../transport/memory-byte-source.ts";
import { browserDecodableFixtureBytes } from "./fixtures/browser-decodable-fixture.ts";

afterEach(() => vi.useRealTimers());

async function inspectWithHost(supported: boolean) {
  const messages: WorkerToMainMessage[] = [];
  const coordinator = createSessionCoordinator({
    capabilities: detectBrowserCapabilities({}),
    createSource: () =>
      Promise.resolve(new MemoryByteSource(browserDecodableFixtureBytes())),
    post: (message) => {
      messages.push(message);
      if (message.type === WorkerToMainMessageType.MSE_QUERY) {
        void coordinator.handleMessage({
          queryId: message.queryId,
          requestId: message.requestId,
          supported,
          type: MainToWorkerMessageType.MSE_RESULT,
        });
      }
    },
    supportsWorkerMse: () => false,
  });
  try {
    await coordinator.handleMessage({
      hostMse: "standard",
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    });
    await coordinator.handleMessage({
      requestId: 7,
      src: "video",
      type: MainToWorkerMessageType.SOURCE,
    });
    return messages;
  } finally {
    coordinator.destroy();
  }
}

test("main-thread MSE accepts a supported video without worker-local MediaSource", async () => {
  const messages = await inspectWithHost(true);
  expect(
    messages.some(
      (message) => message.type === WorkerToMainMessageType.SOURCE_OK,
    ),
  ).toBe(true);
  expect(
    messages.filter(
      (message) => message.type === WorkerToMainMessageType.MSE_QUERY,
    ),
  ).toMatchObject([
    { mime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"', requestId: 7 },
  ]);
});

test("main-thread MIME rejection prevents load acceptance", async () => {
  const messages = await inspectWithHost(false);
  expect(
    messages.some(
      (message) => message.type === WorkerToMainMessageType.SOURCE_OK,
    ),
  ).toBe(false);
  expect(
    messages.filter(
      (message) => message.type === WorkerToMainMessageType.ERROR,
    ),
  ).toMatchObject([{ kind: "unsupported", requestId: 7 }]);
});

function waitingWorker() {
  const messages: WorkerToMainMessage[] = [];
  const coordinator = createSessionCoordinator({
    capabilities: detectBrowserCapabilities({}),
    createSource: () =>
      Promise.resolve(new MemoryByteSource(browserDecodableFixtureBytes())),
    post: (message) => messages.push(message),
    supportsWorkerMse: () => false,
  });
  return { coordinator, messages };
}

test("detaching cancels an unanswered MIME probe without accepting the load", async () => {
  const { coordinator, messages } = waitingWorker();
  try {
    await coordinator.handleMessage({
      hostMse: "standard",
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    });
    const loading = coordinator.handleMessage({
      requestId: 7,
      src: "video",
      type: MainToWorkerMessageType.SOURCE,
    });
    await vi.waitFor(() =>
      expect(
        messages.some(
          (message) => message.type === WorkerToMainMessageType.MSE_QUERY,
        ),
      ).toBe(true),
    );
    await coordinator.handleMessage({ type: MainToWorkerMessageType.DETACH });
    await loading;
    expect(
      messages.some(
        (message) => message.type === WorkerToMainMessageType.SOURCE_OK,
      ),
    ).toBe(false);
    expect(
      messages.some(
        (message) => message.type === WorkerToMainMessageType.ERROR,
      ),
    ).toBe(false);
  } finally {
    coordinator.destroy();
  }
});

test("an unanswered MIME probe reports a bounded host failure", async () => {
  vi.useFakeTimers();
  const { coordinator, messages } = waitingWorker();
  try {
    await coordinator.handleMessage({
      hostMse: "standard",
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    });
    const loading = coordinator.handleMessage({
      requestId: 7,
      src: "video",
      type: MainToWorkerMessageType.SOURCE,
    });
    await vi.waitFor(() =>
      expect(
        messages.some(
          (message) => message.type === WorkerToMainMessageType.MSE_QUERY,
        ),
      ).toBe(true),
    );
    await vi.advanceTimersByTimeAsync(5000);
    await loading;
    expect(
      messages.filter(
        (message) => message.type === WorkerToMainMessageType.ERROR,
      ),
    ).toMatchObject([{ kind: "network", requestId: 7 }]);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    coordinator.destroy();
  }
});
