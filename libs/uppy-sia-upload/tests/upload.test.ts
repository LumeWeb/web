/** Exercises Uppy events against a controlled Sia SDK and a real account controller. */
/* oxlint-disable eslint/no-empty-function, typescript/require-await -- Promise-returning SDK doubles settle at controlled boundaries. */
import { afterEach, describe, expect, test, vi } from "vitest";
import Uppy, { type Meta } from "@uppy/core";
import {
  AccessOutcome,
  createSiaAccess,
  PhraseValidation,
  type SiaAccess,
  type SiaAccessAdapter,
} from "@lumeweb/sia-app-access";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";
import SiaUpload, {
  type SiaUploadBody,
  SiaUploadCancelledError,
  SiaUploadUncertainError,
  uploadToSia,
} from "../src/index.ts";

const handles: { failFree?: boolean; freed: number; metadata?: Uint8Array }[] =
  [];
vi.mock("@siafoundation/sia-storage/wasm", () => ({
  PinnedObject: class {
    failFree = false;
    freed = 0;
    metadata?: Uint8Array;
    constructor() {
      handles.push(this);
    }
    free() {
      this.freed++;
      if (this.failFree) throw new Error("native cleanup failed");
    }
    id() {
      return "object-1";
    }
    updateMetadata(bytes: Uint8Array) {
      this.metadata = bytes;
    }
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, reject, resolve };
}

function setup(sdk: {
  pinObject: (...args: unknown[]) => Promise<void>;
  upload: (...args: unknown[]) => Promise<unknown>;
}) {
  let sessionId: null | string = "account-1";
  const access = {
    getSnapshot: () => ({ activeSessionId: sessionId }),
    withSession: async <T>(
      work: (sdk: SiaSession) => Promise<T> | T,
    ): Promise<T> => {
      if (!sessionId) throw new Error("No account");
      return work(sdk as unknown as SiaSession);
    },
  } as SiaAccess<SiaSession>;
  const uppy = new Uppy<Meta, SiaUploadBody>();
  uppy.use(SiaUpload, { access });
  uppy.addFile({
    data: new File(["hello"], "notes.txt", { type: "text/plain" }),
    name: "notes.txt",
    type: "text/plain",
  });
  return {
    access,
    disconnect: () => {
      sessionId = null;
    },
    replace: () => {
      sessionId = "account-2";
    },
    uppy,
  };
}

afterEach(() => {
  handles.length = 0;
});

describe("Sia Uppy uploads", () => {
  test("an acknowledged pin completes a file without waiting for an object event", async () => {
    const upload = vi.fn(async () => handles[0]);
    const pinObject = vi.fn(async () => undefined);
    const { uppy } = setup({ pinObject, upload });
    const successes: unknown[] = [];
    uppy.on("upload-success", (_, response) => successes.push(response.body));
    const result = await uppy.upload();
    expect(result?.failed).toHaveLength(0);
    expect(successes).toEqual([{ objectId: "object-1" }]);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(handles[0], expect.any(ReadableStream));
    expect(pinObject).toHaveBeenCalledWith(handles[0]);
    expect(handles).toHaveLength(1);
    expect(handles[0]?.freed).toBe(1);
    uppy.destroy();
  });

  test("an upload rejection keeps its error and allows retry before pin", async () => {
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi
        .fn(async (draft: unknown) => draft)
        .mockRejectedValueOnce(new Error("native upload failed")),
    };
    const { uppy } = setup(sdk);
    const errors: Error[] = [];
    const successes: unknown[] = [];
    uppy.on("upload-error", (_, error) => errors.push(error));
    uppy.on("upload-success", (_, response) => successes.push(response.body));
    await uppy.upload();
    expect(errors[0]?.message).toBe("native upload failed");
    expect(errors[0]).not.toBeInstanceOf(SiaUploadUncertainError);
    expect(sdk.pinObject).not.toHaveBeenCalled();
    expect(handles[0]?.freed).toBe(0);
    await uppy.retryAll();
    expect(sdk.upload).toHaveBeenCalledTimes(2);
    expect(sdk.pinObject).toHaveBeenCalledTimes(1);
    expect(successes).toEqual([{ objectId: "object-1" }]);
    expect(handles[1]?.freed).toBe(1);
    uppy.destroy();
  });

  test("cancellation during upload does not claim an object may have been pinned", async () => {
    const uploaded = deferred<unknown>();
    const started = deferred<void>();
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(() => {
        started.resolve();
        return uploaded.promise;
      }),
    };
    const { access, uppy } = setup(sdk);
    const controller = new AbortController();
    const writing = uploadToSia(access, new File(["hello"], "notes.txt"), {
      signal: controller.signal,
    });
    await started.promise;
    controller.abort();
    uploaded.resolve(handles[0]);
    await expect(writing).rejects.toBeInstanceOf(SiaUploadCancelledError);
    expect(sdk.pinObject).not.toHaveBeenCalled();
    expect(handles[0]?.freed).toBe(1);
    uppy.destroy();
  });

  test("a missing pin acknowledgement stays uncertain and never deletes or retries", async () => {
    const upload = vi.fn(async () => handles[0]);
    const pinObject = vi.fn(async () => {
      throw new Error("connection lost");
    });
    const deleteObject = vi.fn(async () => undefined);
    const sdk = { deleteObject, pinObject, upload };
    const { uppy } = setup(sdk);
    const errors: Error[] = [];
    uppy.on("upload-error", (_, error) => errors.push(error));
    await uppy.upload();
    expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
    expect(handles[0]?.freed).toBe(1);
    await uppy.retryAll();
    expect(upload).toHaveBeenCalledTimes(1);
    expect(pinObject).toHaveBeenCalledTimes(1);
    expect(deleteObject).not.toHaveBeenCalled();
    uppy.destroy();
  });

  test("removing a file during pin suppresses late success and retains the account borrow", async () => {
    const pin = deferred<void>();
    const sdk = {
      pinObject: vi.fn(() => pin.promise),
      upload: vi.fn(async () => handles[0]),
    };
    const { uppy } = setup(sdk);
    const started = deferred<void>();
    sdk.pinObject.mockImplementation(() => {
      started.resolve();
      return pin.promise;
    });
    let successes = 0;
    uppy.on("upload-success", () => {
      successes++;
    });
    const result = uppy.upload();
    await started.promise;
    uppy.removeFile(uppy.getFiles()[0]!.id);
    pin.resolve();
    await result;
    expect(successes).toBe(0);
    expect(handles[0]?.freed).toBe(1);
    uppy.destroy();
  });

  test("a shared access controller drains the upload and other work before disconnect", async () => {
    const pin = deferred<void>();
    const pinStarted = deferred<void>();
    let disposed = 0;
    const sdk = {
      object: vi.fn(async () => 77),
      pinObject: vi.fn(() => {
        pinStarted.resolve();
        return pin.promise;
      }),
      upload: vi.fn(async () => handles[0]),
    };
    const adapter: SiaAccessAdapter<SiaSession> = {
      async begin() {
        throw new Error("not used");
      },
      async generateRecoveryPhrase() {
        return "not used";
      },
      async reconnect() {
        return {
          dispose: () => {
            disposed++;
          },
          exportAppKey: () => new Uint8Array(32),
          value: sdk as unknown as SiaSession,
        };
      },
      async validateRecoveryPhrase() {
        return PhraseValidation.Valid;
      },
    };
    const access = createSiaAccess({
      adapter,
      application: {
        appId: "a".repeat(64),
        description: "",
        name: "app",
        serviceUrl: "https://app/",
      },
      credentials: {
        read: async () => new Uint8Array(32),
        remove: async () => undefined,
        write: async () => undefined,
      },
      indexerUrl: "https://indexer/",
    });
    expect((await access.reconnect()).kind).toBe(AccessOutcome.Ready);
    const uppy = new Uppy<Meta, SiaUploadBody>();
    uppy.use(SiaUpload, { access });
    uppy.addFile({
      data: new File(["hello"], "notes.txt"),
      name: "notes.txt",
      type: "text/plain",
    });
    const upload = uppy.upload();
    await pinStarted.promise;
    expect(await access.withSession((shared) => shared.object("other"))).toBe(
      77,
    );
    const closing = access.disconnect();
    expect(disposed).toBe(0);
    await expect(access.withSession(() => 1)).rejects.toThrow();
    pin.resolve();
    const result = await upload;
    expect(result?.failed).toHaveLength(1);
    await closing;
    expect(disposed).toBe(1);
    expect(handles[0]?.freed).toBe(1);
    uppy.destroy();
    await access.dispose();
  });

  test("a batch does not start a second SDK write while the first is active", async () => {
    const first = deferred<unknown>();
    const started = deferred<void>();
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(() => {
        started.resolve();
        return first.promise;
      }),
    };
    const { uppy } = setup(sdk);
    uppy.addFile({
      data: new File(["second"], "second.txt"),
      name: "second.txt",
      type: "text/plain",
    });
    expect(uppy.getFiles()).toHaveLength(2);
    const uploading = uppy.upload();
    await started.promise;
    await Promise.resolve();
    try {
      expect(sdk.upload).toHaveBeenCalledTimes(1);
      expect(handles).toHaveLength(1);
    } finally {
      first.resolve(handles[0]);
      const result = await uploading;
      expect(result?.failed).toHaveLength(0);
      expect(sdk.upload).toHaveBeenCalledTimes(2);
      uppy.destroy();
    }
  });

  test("cancel all never starts a queued second file while the first native pin drains", async () => {
    const pin = deferred<void>();
    const firstStarted = deferred<void>();
    const sdk = {
      pinObject: vi.fn(() => {
        firstStarted.resolve();
        return pin.promise;
      }),
      upload: vi.fn(async () => handles[0]),
    };
    const { uppy } = setup(sdk);
    uppy.addFile({
      data: new File(["second"], "second.txt"),
      name: "second.txt",
      type: "text/plain",
    });
    const uploading = uppy.upload();
    await firstStarted.promise;
    expect(sdk.upload).toHaveBeenCalledTimes(1);
    uppy.cancelAll();
    pin.resolve();
    await uploading;
    expect(sdk.upload).toHaveBeenCalledTimes(1);
    expect(handles[0]?.freed).toBe(1);
    uppy.destroy();
  });

  test("an account replacement during pin cannot publish its old object as new account success", async () => {
    const pin = deferred<void>();
    const started = deferred<void>();
    const sdk = {
      pinObject: vi.fn(() => {
        started.resolve();
        return pin.promise;
      }),
      upload: vi.fn(async () => handles[0]),
    };
    const { replace, uppy } = setup(sdk);
    const successes: unknown[] = [];
    const errors: Error[] = [];
    uppy.on("upload-success", (_, response) => successes.push(response));
    uppy.on("upload-error", (_, error) => errors.push(error));
    const upload = uppy.upload();
    await started.promise;
    replace();
    pin.resolve();
    await upload;
    expect(successes).toEqual([]);
    expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
    expect(sdk.pinObject).toHaveBeenCalledTimes(1);
    uppy.destroy();
  });

  test("cancel all during pin cannot publish late success or retry the uncertain write", async () => {
    const pin = deferred<void>();
    const started = deferred<void>();
    const sdk = {
      pinObject: vi.fn(() => {
        started.resolve();
        return pin.promise;
      }),
      upload: vi.fn(async () => handles[0]),
    };
    const { uppy } = setup(sdk);
    const successes: unknown[] = [];
    uppy.on("upload-success", (_, response) => successes.push(response));
    const upload = uppy.upload();
    await started.promise;
    uppy.cancelAll();
    pin.resolve();
    await upload;
    expect(successes).toEqual([]);
    expect(handles[0]?.freed).toBe(1);
    expect(sdk.upload).toHaveBeenCalledTimes(1);
    uppy.destroy();
  });

  test("metadata is written before upload without putting it in Uppy state", async () => {
    const sdk = {
      pinObject: vi.fn(async () => {}),
      upload: vi.fn(async () => handles[0]),
    };
    const { access, uppy } = setup(sdk);
    const metadata = new Uint8Array([1, 2, 3]);
    uppy.removePlugin(uppy.getPlugin("SiaUpload")!);
    uppy.use(SiaUpload, { access, metadata: () => metadata });
    await uppy.upload();
    expect(handles[0]?.metadata).toEqual(metadata);
    expect(uppy.getFiles()[0]?.meta).not.toHaveProperty("metadata");
    expect(uppy.getFiles()[0]?.meta).not.toHaveProperty("appKey");
    uppy.destroy();
  });

  test("native cleanup failure after an unknown pin result does not hide uncertainty", async () => {
    const sdk = {
      pinObject: vi.fn(async () => {
        throw new Error("pin reply lost");
      }),
      upload: vi.fn(async () => {
        const { PinnedObject } =
          await import("@siafoundation/sia-storage/wasm");
        const child = new PinnedObject();
        handles[1]!.failFree = true;
        return child;
      }),
    };
    const { uppy } = setup(sdk);
    const errors: Error[] = [];
    uppy.on("upload-error", (_, error) => errors.push(error));
    await uppy.upload();
    expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
    expect(handles[1]?.freed).toBe(1);
    uppy.destroy();
  });

  test("an empty file is rejected before Sia writes slabs it cannot pin", async () => {
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(async () => handles[0]),
    };
    const { access, uppy } = setup(sdk);
    await expect(
      uploadToSia(access, new File([], "empty.txt")),
    ).rejects.toThrow("Empty files");
    expect(sdk.upload).not.toHaveBeenCalled();
    expect(handles).toHaveLength(0);
    uppy.destroy();
  });

  test("a file stream that cannot open frees the draft without starting a remote write", async () => {
    const sdk = {
      pinObject: vi.fn(async () => {}),
      upload: vi.fn(async () => handles[0]),
    };
    const { access, uppy } = setup(sdk);
    const file = new File(["hello"], "notes.txt");
    Object.defineProperty(file, "stream", {
      value: () => {
        throw new Error("stream unavailable");
      },
    });
    await expect(uploadToSia(access, file)).rejects.toThrow(
      "stream unavailable",
    );
    expect(sdk.upload).not.toHaveBeenCalled();
    expect(handles[0]?.freed).toBe(1);
    uppy.destroy();
  });

  test("pre-write failure frees the draft, while an uploaded child is freed once", async () => {
    const { PinnedObject } = await import("@siafoundation/sia-storage/wasm");
    const sdk = {
      pinObject: vi.fn(async () => {}),
      upload: vi.fn(async () => new PinnedObject()),
    };
    const { uppy } = setup(sdk);
    await uppy.upload();
    expect(handles).toHaveLength(2);
    expect(handles[0]?.freed).toBe(0);
    expect(handles[1]?.freed).toBe(1);
    uppy.destroy();
  });
});
