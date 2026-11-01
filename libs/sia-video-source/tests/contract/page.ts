/** Reads existing objects through the real SDK streaming service without provisioning fixtures. */
import {
  createSiaStreamService,
  type SiaNativeStreamFile,
} from "@lumeweb/sia-video-source/sia";
import { createTransferBudget } from "./budget.ts";
import type { ContractConfig, ContractFixture } from "./config.ts";

export interface ContractResult {
  readonly ok: boolean;
  readonly phase: Phase;
}
type Phase = "app" | "cleanup" | "denied-access" | "shared";
type Service = ReturnType<typeof createSiaStreamService>;

function decodedFrame(
  video: HTMLVideoElement,
  signal: AbortSignal,
): Promise<number> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.cancelVideoFrameCallback(id);
      signal.removeEventListener("abort", fail);
      video.removeEventListener("error", fail);
    };
    const fail = () => {
      cleanup();
      reject(new Error("Video frame unavailable"));
    };
    const id = video.requestVideoFrameCallback((_now, metadata) => {
      cleanup();
      resolve(metadata.mediaTime);
    });
    signal.addEventListener("abort", fail, { once: true });
    video.addEventListener("error", fail, { once: true });
  });
}

async function knownRange(
  file: SiaNativeStreamFile,
  fixture: ContractFixture,
  signal: AbortSignal,
): Promise<void> {
  const end = fixture.rangeOffset + fixture.rangeBytes.length - 1;
  const response = await fetch(file.url, {
    headers: { Range: `bytes=${fixture.rangeOffset}-${end}` },
    redirect: "error",
    signal,
  });
  if (
    response.status !== 206 ||
    response.headers.get("Content-Range") !==
      `bytes ${fixture.rangeOffset}-${end}/${fixture.sizeBytes}` ||
    !response.body
  ) {
    await response.body?.cancel();
    throw new Error("Unexpected range response");
  }
  const reader = response.body.getReader();
  let offset = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (offset + value.length > fixture.rangeBytes.length)
        throw new Error("Oversized range");
      for (const byte of value) {
        if (byte !== fixture.rangeBytes[offset++])
          throw new Error("Range content mismatch");
      }
    }
    if (offset !== fixture.rangeBytes.length)
      throw new Error("Incomplete range");
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

async function playback(
  video: HTMLVideoElement,
  url: string,
  fixture: ContractFixture,
  signal: AbortSignal,
): Promise<void> {
  video.src = url;
  await Promise.all([decodedFrame(video, signal), video.play()]);
  if (!Number.isFinite(video.duration) || fixture.seekSeconds >= video.duration)
    throw new Error("Seek is outside the fixture");
  video.pause();
  signal.throwIfAborted();
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      signal.removeEventListener("abort", fail);
      video.removeEventListener("error", fail);
      video.removeEventListener("seeked", finish);
    };
    const fail = () => {
      cleanup();
      reject(new Error("Seek failed"));
    };
    const finish = () => {
      cleanup();
      resolve();
    };
    signal.addEventListener("abort", fail, { once: true });
    video.addEventListener("error", fail, { once: true });
    video.addEventListener("seeked", finish, { once: true });
    video.currentTime = fixture.seekSeconds;
  });
  const [resumed] = await Promise.all([
    decodedFrame(video, signal),
    video.play(),
  ]);
  if (resumed < fixture.seekSeconds - 0.1)
    throw new Error("Playback did not resume at the seek target");
  video.pause();
}

async function run(config: ContractConfig): Promise<ContractResult> {
  const video = document.querySelector("video")!;
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), config.timeoutMs);
  const budget = createTransferBudget(config.maxTransferBytes, () =>
    abort.abort(),
  );
  const services: Service[] = [];
  const files: SiaNativeStreamFile[] = [];
  let phase: Phase = "app";
  let result: ContractResult;
  const service = () => {
    const owned = createSiaStreamService({
      auth: {
        get: () => ({
          indexerUrl: config.indexerUrl,
          sharingKeyHex: config.sharingKeyHex,
          userKeyHex: config.userKeyHex,
        }),
      },
    });
    services.push(owned);
    return owned;
  };
  async function check(
    owned: Service,
    fixture: ContractFixture,
    kind: "app" | "shared",
  ) {
    if (
      !(await owned.prepare(abort.signal)) ||
      !navigator.serviceWorker.controller
    )
      throw new Error("SDK streaming worker unavailable");
    const source = await owned.resolve(fixture.objectId, abort.signal, kind);
    const session = await owned.session(source, abort.signal);
    const file = await session.url(source, {
      name: "contract.mp4",
      onProgress: budget.progress(),
      signal: abort.signal,
      type: "video/mp4",
    });
    files.push(file);
    if (file.blob || new URL(file.url).origin !== location.origin)
      throw new Error("SDK did not provide a streaming URL");
    await knownRange(file, fixture, abort.signal);
    await playback(video, file.url, fixture, abort.signal);
    video.removeAttribute("src");
    video.load();
    file.release();
  }
  try {
    await check(service(), config.app, "app");
    phase = "shared";
    const shared = service();
    await check(shared, config.shared, "shared");
    phase = "denied-access";
    const source = await shared.resolve(
      config.app.objectId,
      abort.signal,
      "shared",
    );
    let denied = false;
    try {
      const session = await shared.session(source, abort.signal);
      const file = await session.url(source, {
        name: "denied.mp4",
        signal: abort.signal,
      });
      files.push(file);
      file.release();
    } catch {
      abort.signal.throwIfAborted();
      denied = true;
    }
    if (!denied)
      throw new Error("Sharing credential could read the private app fixture");
    result = { ok: true, phase };
  } catch {
    // SDK failures may contain credentials; return only the fixed phase label.
    result = { ok: false, phase };
  } finally {
    clearTimeout(timeout);
    abort.abort();
    let clean = true;
    try {
      video.pause();
      video.removeAttribute("src");
      video.load();
    } catch {
      clean = false;
    }
    for (const file of files) {
      try {
        file.release();
      } catch {
        clean = false;
      }
    }
    for (const owned of services) {
      try {
        owned.dispose();
      } catch {
        clean = false;
      }
    }
    if (!clean) result = { ok: false, phase: "cleanup" };
  }
  return result;
}

declare global {
  interface Window {
    sdkContract: { run: typeof run };
  }
}
window.sdkContract = { run };
document.querySelector("#status")!.textContent = "ready";
