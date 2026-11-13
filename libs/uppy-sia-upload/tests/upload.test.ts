/** Checks uploader handle ownership and progress at the WASM-shaped boundary. */
/* oxlint-disable eslint/no-empty-function, typescript/require-await -- The native boundary doubles return SDK-shaped promises. */
import { afterEach, describe, expect, test, vi } from "vitest";
import Uppy, { type Meta } from "@uppy/core";
import type { UploadOptions } from "@siafoundation/sia-storage/wasm";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";
import SiaUpload, {
  type SiaUploadBody,
  SiaUploadUncertainError,
  type UploadAccess,
  uploadToSia,
} from "../src/index.ts";

const handles: { failFree?: boolean; freed: number }[] = [];
vi.mock("@siafoundation/sia-storage/wasm", () => ({
  encodedSize: () => 125_829_120,
  PinnedObject: class {
    failFree = false;
    freed = 0;
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
  },
}));

function setup(sdk: {
  pinObject: (...args: unknown[]) => Promise<void>;
  upload: (...args: unknown[]) => Promise<unknown>;
}) {
  const access = {
    getSnapshot: () => ({ activeSessionId: "account-1" }),
    withSession: async <T>(
      work: (session: SiaSession) => Promise<T> | T,
    ): Promise<T> =>
      work({
        ...sdk,
        appKey: () => ({
          free: () => undefined,
          publicKey: () => "ed25519:account-1",
        }),
      } as unknown as SiaSession),
  } as UploadAccess;
  const uppy = new Uppy<Meta, SiaUploadBody>();
  uppy.use(SiaUpload, { access });
  uppy.addFile({
    data: new File(["hello"], "document.bin"),
    name: "document.bin",
    type: "application/octet-stream",
  });
  return { access, uppy };
}

afterEach(() => {
  handles.length = 0;
});

describe("WASM-shaped upload boundary", () => {
  test("a repeated shard acknowledgement does not advance host progress twice", async () => {
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(async (...args: unknown[]) => {
        const { PinnedObject } =
          await import("@siafoundation/sia-storage/wasm");
        const options = args[2] as UploadOptions;
        const shard = {
          elapsedMs: 1,
          hostKey: `ed25519:${"a".repeat(64)}`,
          shardIndex: 0,
          shardSize: 4_194_304,
          slabIndex: 0,
        };
        options.onShardUploaded?.(shard);
        options.onShardUploaded?.({
          ...shard,
          hostKey: `ed25519:${"b".repeat(64)}`,
        });
        options.onShardUploaded?.({ ...shard, shardIndex: 1 });
        return new PinnedObject();
      }),
    };
    const { access, uppy } = setup(sdk);
    try {
      const progress: number[] = [];
      await uploadToSia(access, new File(["hello"], "document.bin"), {
        onProgress: (event) => {
          expect(event.bytesTotal).toBe(125_829_120);
          progress.push(event.bytesUploaded);
        },
      });
      expect(progress).toEqual([4_194_304, 8_388_608]);
      expect(sdk.pinObject).toHaveBeenCalledTimes(1);
    } finally {
      uppy.destroy();
    }
  });

  test("a removed file does not receive a late shard acknowledgement", async () => {
    let notifyEntered!: () => void;
    let resumeUpload!: () => void;
    const entered = new Promise<void>((resolve) => {
      notifyEntered = resolve;
    });
    const resumed = new Promise<void>((resolve) => {
      resumeUpload = resolve;
    });
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(async (...args: unknown[]) => {
        const { PinnedObject } =
          await import("@siafoundation/sia-storage/wasm");
        notifyEntered();
        await resumed;
        (args[2] as UploadOptions).onShardUploaded?.({
          elapsedMs: 1,
          hostKey: `ed25519:${"a".repeat(64)}`,
          shardIndex: 0,
          shardSize: 4_194_304,
          slabIndex: 0,
        });
        return new PinnedObject();
      }),
    };
    const { uppy } = setup(sdk);
    const progress: number[] = [];
    uppy.on("upload-progress", (_file, event) =>
      progress.push(event.bytesUploaded),
    );
    const writing = uppy.upload();
    try {
      await entered;
      uppy.removeFile(uppy.getFiles()[0]!.id);
      resumeUpload();
      await writing;
      expect(progress).toHaveLength(0);
      expect(sdk.pinObject).not.toHaveBeenCalled();
    } finally {
      resumeUpload();
      await writing;
      uppy.destroy();
    }
  });

  test("failed cleanup after a lost pin reply does not hide uncertainty", async () => {
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
    try {
      const errors: Error[] = [];
      uppy.on("upload-error", (_, error) => errors.push(error));
      await uppy.upload();
      expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
      expect(handles[1]?.freed).toBe(1);
    } finally {
      uppy.destroy();
    }
  });

  test("failed cleanup after an acknowledged pin reports uncertainty instead of success", async () => {
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(async () => {
        const { PinnedObject } =
          await import("@siafoundation/sia-storage/wasm");
        const child = new PinnedObject();
        handles[1]!.failFree = true;
        return child;
      }),
    };
    const { uppy } = setup(sdk);
    try {
      const errors: Error[] = [];
      const successes: string[] = [];
      uppy.on("upload-error", (_file, error) => errors.push(error));
      uppy.on("upload-success", (_file, response) =>
        successes.push(response.body?.objectId ?? ""),
      );
      expect((await uppy.upload())?.failed).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
      expect((errors[0] as SiaUploadUncertainError).objectId).toBe("object-1");
      expect(successes).toHaveLength(0);
      expect(sdk.pinObject).toHaveBeenCalledTimes(1);
      expect(handles[1]?.freed).toBe(1);
      await uppy.retryAll();
      expect(sdk.upload).toHaveBeenCalledTimes(1);
    } finally {
      uppy.destroy();
    }
  });

  test("a file stream that cannot open frees the draft without a remote write", async () => {
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(async () => handles[0]),
    };
    const { access, uppy } = setup(sdk);
    try {
      const file = new File(["hello"], "document.bin");
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
    } finally {
      uppy.destroy();
    }
  });

  test("a rejected SDK upload leaves the draft with the SDK and allows retry", async () => {
    const failure = new Error("native upload failed");
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi
        .fn(async () => {
          const { PinnedObject } =
            await import("@siafoundation/sia-storage/wasm");
          return new PinnedObject();
        })
        .mockRejectedValueOnce(failure),
    };
    const { uppy } = setup(sdk);
    try {
      const errors: Error[] = [];
      uppy.on("upload-error", (_file, error) => errors.push(error));
      expect((await uppy.upload())?.failed).toHaveLength(1);
      expect(errors[0]).toBe(failure);
      expect(sdk.pinObject).not.toHaveBeenCalled();
      expect(handles).toHaveLength(1);
      expect(handles[0]?.freed).toBe(0);
      expect((await uppy.retryAll())?.failed).toHaveLength(0);
      expect(sdk.upload).toHaveBeenCalledTimes(2);
      expect(sdk.pinObject).toHaveBeenCalledTimes(1);
      expect(handles).toHaveLength(3);
      expect(handles[1]?.freed).toBe(0);
      expect(handles[2]?.freed).toBe(1);
    } finally {
      uppy.destroy();
    }
  });

  test("the uploader leaves the transferred draft and frees the returned handle once", async () => {
    const { PinnedObject } = await import("@siafoundation/sia-storage/wasm");
    const sdk = {
      pinObject: vi.fn(async () => undefined),
      upload: vi.fn(async () => new PinnedObject()),
    };
    const { uppy } = setup(sdk);
    try {
      expect((await uppy.upload())?.failed).toHaveLength(0);
      expect(handles).toHaveLength(2);
      expect(handles[0]?.freed).toBe(0);
      expect(handles[1]?.freed).toBe(1);
      expect(sdk.pinObject).toHaveBeenCalledTimes(1);
    } finally {
      uppy.destroy();
    }
  });
});
