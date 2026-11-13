/** Exercises Uppy uploads through Sia testing's SDK-shaped upload and pin calls. */
import { expect, vi } from "vitest";
import Uppy, { type Meta } from "@uppy/core";
import {
  type BrowserAccess,
  MockPinnedObject,
  type MockSia,
  type UploadSdk,
} from "@lumeweb/sia-testing/mock";
import { createSiaTest } from "@lumeweb/sia-testing/vitest";
import {
  AccessOutcome,
  createSiaAccess,
  PhraseValidation,
  type SiaAccessAdapter,
} from "@lumeweb/sia-app-access";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";
import SiaUpload, {
  type SiaUploadBody,
  SiaUploadCancelledError,
  SiaUploadUncertainError,
  type UploadAccess,
  uploadToSia,
} from "../src/index.ts";

vi.mock("@siafoundation/sia-storage/wasm", () => ({
  encodedSize: () => 125_829_120,
  PinnedObject: MockPinnedObject,
}));

const siaTest = createSiaTest({
  backend: {
    app: {
      description: "Synthetic upload and pin checks",
      id: "a".repeat(64),
      name: "Uppy uploads",
      serviceUrl: "https://example.invalid",
    },
    kind: "mock",
  },
});

interface Scenario {
  access: UploadAccess;
  actor: ReturnType<MockSia["actor"]>;
  replace: () => void;
  restore: () => void;
  sdk: UploadSdk;
  uppy: Uppy<Meta, SiaUploadBody>;
}
interface SiaFixture {
  mock: MockSia;
  ownerAccess: BrowserAccess;
}

function addSecond(uppy: Uppy<Meta, SiaUploadBody>) {
  return uppy.addFile({
    data: new File(["second"], "second.txt", { type: "text/plain" }),
    name: "second.txt",
    type: "text/plain",
  });
}

function attempts(mock: MockSia, operation: "pin" | "upload") {
  return mock
    .history()
    .filter((row) => row.operation === operation && !row.stage);
}

async function withUpload(
  sia: SiaFixture,
  work: (scenario: Scenario) => Promise<void>,
  options: {
    metadata?: (file: File) => Uint8Array;
    onUncertain?: (
      fileId: string,
      error: SiaUploadUncertainError,
      sessionId: string,
    ) => void;
  } = {},
): Promise<void> {
  const actor = sia.mock.actor("uppy upload");
  const sdk = sia.mock.uploadSdk({
    access: sia.ownerAccess,
    as: actor,
    maxBytes: 1024,
  });
  let sessionId: null | string = "account-1";
  // Only the account identity changes here; upload and pin still run through the mock SDK.
  const otherAccount = Object.assign(Object.create(sdk) as UploadSdk, {
    appKey: () => ({
      free: () => undefined,
      publicKey: () => "ed25519:account-2",
    }),
  });
  const access = {
    getSnapshot: () => ({ activeSessionId: sessionId }),
    withSession: async <T>(work: (session: SiaSession) => Promise<T> | T) => {
      if (!sessionId) throw new Error("No account");
      return work(
        (sessionId === "account-2"
          ? otherAccount
          : sdk) as unknown as SiaSession,
      );
    },
  } as UploadAccess;
  const uppy = new Uppy<Meta, SiaUploadBody>();
  uppy.use(SiaUpload, {
    access,
    ...(options.metadata ? { metadata: options.metadata } : {}),
    ...(options.onUncertain
      ? {
          onUncertain: (file, error, activeSessionId) =>
            options.onUncertain!(file.id, error, activeSessionId),
        }
      : {}),
  });
  uppy.addFile({
    data: new File([Uint8Array.of(1, 2, 3)], "document.bin", {
      type: "application/octet-stream",
    }),
    name: "document.bin",
    type: "application/octet-stream",
  });
  try {
    await work({
      access,
      actor,
      replace: () => {
        sessionId = "account-2";
      },
      restore: () => {
        sessionId = "account-1-reconnected";
      },
      sdk,
      uppy,
    });
  } finally {
    uppy.destroy();
    await sdk.close();
  }
}

siaTest(
  "an acknowledged pin makes the uploaded bytes readable",
  async ({ sia }) => {
    await withUpload(
      sia,
      async ({ sdk, uppy }) => {
        const key = sdk.appKey();
        const freeKey = vi.spyOn(key, "free");
        vi.spyOn(sdk, "appKey").mockReturnValue(key);
        const successes: string[] = [];
        uppy.on("upload-success", (_file, response) =>
          successes.push(response.body?.objectId ?? ""),
        );
        expect((await uppy.upload())?.failed).toHaveLength(0);
        expect(successes).toHaveLength(1);
        expect(freeKey).toHaveBeenCalledTimes(1);
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
        expect(attempts(sia.mock, "pin")).toMatchObject([
          { committed: true, status: "completed" },
        ]);
        const reader = sia.mock.reader({
          access: sia.ownerAccess,
          as: sia.mock.actor("owner reader"),
        });
        try {
          const object = await reader.object(successes[0]!);
          expect([...object.metadata]).toEqual([9, 8]);
          expect(
            new Uint8Array(
              await new Response(await reader.download(object)).arrayBuffer(),
            ),
          ).toEqual(Uint8Array.of(1, 2, 3));
        } finally {
          await reader.close();
        }
      },
      { metadata: () => Uint8Array.of(9, 8) },
    );
  },
);

siaTest(
  "host shard acknowledgements advance Uppy progress before pin",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, uppy }) => {
      const file = uppy.getFiles()[0]!;
      const queuedId = addSecond(uppy);
      const progress: { bytesTotal: null | number; bytesUploaded: number }[] =
        [];
      uppy.on("upload-progress", (current, event) => {
        if (current?.id === file.id)
          progress.push({
            bytesTotal: event.bytesTotal,
            bytesUploaded: event.bytesUploaded,
          });
      });
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const writing = uppy.upload();
      try {
        await Promise.race([
          hold.started(),
          writing.then(() => {
            throw new Error("Upload ended before pin started");
          }),
        ]);
        expect(progress).toHaveLength(30);
        expect(progress[0]).toEqual({ bytesTotal: 3, bytesUploaded: 0.1 });
        expect(progress.at(-1)).toEqual({ bytesTotal: 3, bytesUploaded: 3 });
        expect(uppy.getFile(file.id)?.progress.uploadComplete).toBe(false);
        expect(uppy.getFile(queuedId)?.progress.bytesTotal).toBe(6);
        expect(uppy.getFile(queuedId)?.progress.bytesUploaded).toBe(0);
      } finally {
        hold.release();
      }
      expect((await writing)?.failed).toHaveLength(0);
      expect(uppy.getFile(file.id)?.progress.uploadComplete).toBe(true);
    });
  },
);

siaTest("a failed staged upload can retry before pinning", async ({ sia }) => {
  const outcomes: SiaUploadUncertainError[] = [];
  await withUpload(
    sia,
    async ({ actor, uppy }) => {
      const errors: Error[] = [];
      uppy.on("upload-error", (_file, error) => errors.push(error));
      sia.mock.mutationFaults.fail(
        { actor, operation: "upload", stage: "beforeCommit" },
        { code: "unavailable", times: 1 },
      );
      expect((await uppy.upload())?.failed).toHaveLength(1);
      expect(errors[0]).toMatchObject({ code: "unavailable" });
      expect(errors[0]).not.toBeInstanceOf(SiaUploadUncertainError);
      expect(attempts(sia.mock, "pin")).toHaveLength(0);
      expect(outcomes).toHaveLength(0);
      expect((await uppy.retryAll())?.failed).toHaveLength(0);
      expect(attempts(sia.mock, "upload")).toMatchObject([
        { committed: false, status: "failed" },
        { committed: true, status: "completed" },
      ]);
      expect(attempts(sia.mock, "pin")).toHaveLength(1);
    },
    { onUncertain: (_id, error) => outcomes.push(error) },
  );
});

siaTest(
  "a lost pin reply keeps the committed object and blocks retry",
  async ({ sia }) => {
    const outcomes: SiaUploadUncertainError[] = [];
    await withUpload(
      sia,
      async ({ actor, uppy }) => {
        sia.mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        expect((await uppy.upload())?.failed).toHaveLength(1);
        expect(outcomes).toHaveLength(1);
        const objectId = outcomes[0]?.objectId;
        expect(objectId).toBeTruthy();
        const reader = sia.mock.reader({
          access: sia.ownerAccess,
          as: sia.mock.actor("owner reader"),
        });
        try {
          expect((await reader.object(objectId!)).id).toBe(objectId);
        } finally {
          await reader.close();
        }
        await uppy.retryAll();
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
        expect(attempts(sia.mock, "pin")).toMatchObject([
          { committed: true, status: "failed" },
        ]);
        expect(
          sia.mock.history().filter((row) => row.operation === "delete"),
        ).toHaveLength(0);
      },
      { onUncertain: (_id, error) => outcomes.push(error) },
    );
  },
);

siaTest(
  "cancellation during upload does not report an unknown pin",
  async ({ sia }) => {
    await withUpload(sia, async ({ access, actor }) => {
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "upload",
        stage: "beforeCommit",
      });
      const controller = new AbortController();
      const writing = uploadToSia(access, new File(["hello"], "document.bin"), {
        signal: controller.signal,
      });
      try {
        await hold.started();
        controller.abort();
      } finally {
        hold.release();
      }
      await expect(writing).rejects.toBeInstanceOf(SiaUploadCancelledError);
      expect(attempts(sia.mock, "pin")).toHaveLength(0);
    });
  },
);

siaTest(
  "an uncertain file ID blocks its account until that account clears it",
  async ({ sia }) => {
    const outcomes: SiaUploadUncertainError[] = [];
    await withUpload(
      sia,
      async ({ actor, replace, restore, uppy }) => {
        const file = uppy.getFiles()[0]!;
        const plugin = uppy.getPlugin("SiaUpload") as SiaUpload;
        sia.mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        await uppy.upload();
        expect(outcomes).toHaveLength(1);
        replace();
        await expect(plugin.clearUncertain(file.id)).resolves.toBe(false);
        expect((await uppy.retryAll())?.failed).toHaveLength(0);
        expect(attempts(sia.mock, "upload")).toHaveLength(2);
        restore();
        uppy.removeFile(file.id);
        uppy.addFile({ data: file.data!, name: file.name, type: file.type });
        await uppy.upload();
        expect(attempts(sia.mock, "upload")).toHaveLength(2);
        expect(outcomes).toHaveLength(1);
        await expect(plugin.clearUncertain(file.id)).resolves.toBe(true);
        await uppy.retryAll();
        expect(attempts(sia.mock, "upload")).toHaveLength(3);
      },
      { onUncertain: (_id, error) => outcomes.push(error) },
    );
  },
);

siaTest(
  "reconnecting the same account does not clear an unknown pin",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, restore, uppy }) => {
      sia.mock.mutationFaults.loseReply(
        { actor, operation: "pin" },
        { times: 1 },
      );
      await uppy.upload();
      restore();
      await uppy.retryAll();
      expect(attempts(sia.mock, "upload")).toHaveLength(1);
    });
  },
);

siaTest(
  "removing a file during pin suppresses late success",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, uppy }) => {
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const successes: string[] = [];
      uppy.on("upload-success", (file) => successes.push(file?.id ?? ""));
      const writing = uppy.upload();
      try {
        await hold.started();
        uppy.removeFile(uppy.getFiles()[0]!.id);
      } finally {
        hold.release();
      }
      await writing;
      expect(successes).toHaveLength(0);
      expect(attempts(sia.mock, "pin")).toHaveLength(1);
    });
  },
);

siaTest(
  "a batch does not start a second SDK write while the first is active",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, uppy }) => {
      addSecond(uppy);
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "upload",
        stage: "beforeCommit",
      });
      const writing = uppy.upload();
      try {
        await hold.started();
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
      } finally {
        hold.release();
      }
      expect((await writing)?.failed).toHaveLength(0);
      expect(attempts(sia.mock, "upload")).toHaveLength(2);
      expect(attempts(sia.mock, "pin")).toHaveLength(2);
    });
  },
);

siaTest(
  "a removed queued file does not upload when its ID is reused",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, uppy }) => {
      const queuedId = addSecond(uppy);
      const queued = uppy.getFile(queuedId);
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const successes: string[] = [];
      uppy.on("upload-success", (file) => successes.push(file?.name ?? ""));
      const writing = uppy.upload();
      try {
        await hold.started();
        uppy.removeFile(queuedId);
        expect(
          uppy.addFile({
            data: queued.data!,
            name: queued.name,
            type: queued.type,
          }),
        ).toBe(queuedId);
      } finally {
        hold.release();
      }
      await writing;
      expect(attempts(sia.mock, "upload")).toHaveLength(1);
      expect(successes).toEqual(["document.bin"]);
      expect(uppy.getFile(queuedId)?.progress.uploadComplete).toBe(false);
      await uppy.upload();
      expect(attempts(sia.mock, "upload")).toHaveLength(2);
      expect(successes).toEqual(["document.bin", "second.txt"]);
    });
  },
);

siaTest(
  "a queued file does not switch accounts after its batch starts",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, replace, uppy }) => {
      addSecond(uppy);
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const errors: { error: Error; file: string }[] = [];
      uppy.on("upload-error", (file, error) =>
        errors.push({ error, file: file?.name ?? "" }),
      );
      const writing = uppy.upload();
      try {
        await hold.started();
        replace();
      } finally {
        hold.release();
      }
      await writing;
      expect(attempts(sia.mock, "upload")).toHaveLength(1);
      expect(
        errors.find(({ file }) => file === "second.txt")?.error.message,
      ).toBe("The Sia account changed during this upload batch");
    });
  },
);

siaTest(
  "a replacement file waits for its removed predecessor before uploading",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, uppy }) => {
      const file = uppy.getFiles()[0]!;
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "upload",
        stage: "beforeCommit",
      });
      const successes: string[] = [];
      uppy.on("upload-success", (uploaded) =>
        successes.push(uploaded?.id ?? ""),
      );
      const original = uppy.upload();
      let replacement: ReturnType<typeof uppy.upload> | undefined;
      try {
        await hold.started();
        uppy.removeFile(file.id);
        expect(
          uppy.addFile({ data: file.data!, name: file.name, type: file.type }),
        ).toBe(file.id);
        replacement = uppy.upload();
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
      } finally {
        hold.release();
      }
      await Promise.all([original, replacement]);
      expect(attempts(sia.mock, "upload")).toHaveLength(2);
      expect(attempts(sia.mock, "pin")).toHaveLength(1);
      expect(successes).toEqual([file.id]);
    });
  },
);

siaTest(
  "a replacement file cannot retry while its old pin outcome is uncertain",
  async ({ sia }) => {
    const outcomes: (string | undefined)[] = [];
    await withUpload(
      sia,
      async ({ actor, uppy }) => {
        const file = uppy.getFiles()[0]!;
        const hold = sia.mock.mutationFaults.hold({
          actor,
          operation: "pin",
          stage: "beforeCommit",
        });
        const original = uppy.upload();
        const errors: Error[] = [];
        uppy.on("upload-error", (_file, error) => errors.push(error));
        let replacement: ReturnType<typeof uppy.upload> | undefined;
        try {
          await hold.started();
          uppy.removeFile(file.id);
          expect(
            uppy.addFile({
              data: file.data!,
              name: file.name,
              type: file.type,
            }),
          ).toBe(file.id);
          replacement = uppy.upload();
          expect(attempts(sia.mock, "upload")).toHaveLength(1);
        } finally {
          hold.release();
        }
        await Promise.all([original, replacement]);
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
        expect(outcomes).toHaveLength(1);
        expect(outcomes[0]).toBeTruthy();
        expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
      },
      { onUncertain: (_id, error) => outcomes.push(error.objectId) },
    );
  },
);

siaTest(
  "cancel all never starts a queued second file while the first pin drains",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, uppy }) => {
      addSecond(uppy);
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const writing = uppy.upload();
      try {
        await hold.started();
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
        uppy.cancelAll();
      } finally {
        hold.release();
      }
      await writing;
      expect(attempts(sia.mock, "upload")).toHaveLength(1);
    });
  },
);

siaTest(
  "account replacement during pin cannot publish the old object's success",
  async ({ sia }) => {
    await withUpload(sia, async ({ actor, replace, uppy }) => {
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const successes: string[] = [];
      const errors: Error[] = [];
      uppy.on("upload-success", (file) => successes.push(file?.id ?? ""));
      uppy.on("upload-error", (_file, error) => errors.push(error));
      const writing = uppy.upload();
      try {
        await hold.started();
        replace();
      } finally {
        hold.release();
      }
      await writing;
      expect(successes).toHaveLength(0);
      expect(errors[0]).toBeInstanceOf(SiaUploadUncertainError);
      expect(attempts(sia.mock, "pin")).toHaveLength(1);
    });
  },
);

siaTest(
  "cancel all during pin reports uncertainty without late success",
  async ({ sia }) => {
    const outcomes: {
      fileId: string;
      objectId: string | undefined;
      sessionId: string;
    }[] = [];
    await withUpload(
      sia,
      async ({ actor, uppy }) => {
        const fileId = uppy.getFiles()[0]!.id;
        const hold = sia.mock.mutationFaults.hold({
          actor,
          operation: "pin",
          stage: "beforeCommit",
        });
        const successes: string[] = [];
        uppy.on("upload-success", (file) => successes.push(file?.id ?? ""));
        const writing = uppy.upload();
        try {
          await hold.started();
          uppy.cancelAll();
        } finally {
          hold.release();
        }
        await writing;
        expect(successes).toHaveLength(0);
        expect(outcomes).toHaveLength(1);
        expect(outcomes[0]).toMatchObject({ fileId, sessionId: "account-1" });
        expect(outcomes[0]?.objectId).toBeTruthy();
        expect(attempts(sia.mock, "upload")).toHaveLength(1);
      },
      {
        onUncertain: (fileId, error, sessionId) =>
          outcomes.push({ fileId, objectId: error.objectId, sessionId }),
      },
    );
  },
);

siaTest(
  "metadata reaches the pinned object without entering Uppy state",
  async ({ sia }) => {
    await withUpload(
      sia,
      async ({ uppy }) => {
        expect((await uppy.upload())?.failed).toHaveLength(0);
        const file = uppy.getFiles()[0]!;
        expect(file.meta).not.toHaveProperty("metadata");
        expect(file.meta).not.toHaveProperty("appKey");
        const reader = sia.mock.reader({
          access: sia.ownerAccess,
          as: sia.mock.actor("metadata reader"),
        });
        try {
          expect(
            (await reader.object(file.response!.body!.objectId)).metadata,
          ).toEqual(Uint8Array.of(1, 2, 3));
        } finally {
          await reader.close();
        }
      },
      { metadata: () => Uint8Array.of(1, 2, 3) },
    );
  },
);

siaTest(
  "an empty file is rejected before Sia starts an upload",
  async ({ sia }) => {
    await withUpload(sia, async ({ access }) => {
      await expect(
        uploadToSia(access, new File([], "empty.txt")),
      ).rejects.toThrow("Empty files");
      expect(attempts(sia.mock, "upload")).toHaveLength(0);
    });
  },
);

siaTest(
  "the shared account drains an upload and other work before disconnect",
  async ({ sia }) => {
    const actor = sia.mock.actor("shared uploader");
    const sdk = sia.mock.uploadSdk({
      access: sia.ownerAccess,
      as: actor,
      maxBytes: 1024,
    });
    let disposed = 0;
    const adapter: SiaAccessAdapter<SiaSession> = {
      begin() {
        return Promise.reject(new Error("not used"));
      },
      generateRecoveryPhrase() {
        return Promise.resolve("not used");
      },
      reconnect() {
        return Promise.resolve({
          dispose: () => {
            disposed++;
          },
          exportAppKey: () => new Uint8Array(32),
          value: sdk as unknown as SiaSession,
        });
      },
      validateRecoveryPhrase() {
        return Promise.resolve(PhraseValidation.Valid);
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
        read: () => Promise.resolve(new Uint8Array(32)),
        remove: () => Promise.resolve(),
        write: () => Promise.resolve(),
      },
      indexerUrl: "https://indexer/",
    });
    const uppy = new Uppy<Meta, SiaUploadBody>();
    try {
      expect((await access.reconnect()).kind).toBe(AccessOutcome.Ready);
      uppy.use(SiaUpload, { access });
      uppy.addFile({
        data: new File(["hello"], "document.bin"),
        name: "document.bin",
        type: "application/octet-stream",
      });
      const hold = sia.mock.mutationFaults.hold({
        actor,
        operation: "pin",
        stage: "beforeCommit",
      });
      const writing = uppy.upload();
      let closing: ReturnType<typeof access.disconnect> | undefined;
      try {
        await hold.started();
        expect(
          await access.withSession((shared) => {
            const key = shared.appKey();
            try {
              return key.publicKey();
            } finally {
              key.free();
            }
          }),
        ).toMatch(/^ed25519:/);
        closing = access.disconnect();
        expect(disposed).toBe(0);
        await expect(access.withSession(() => 1)).rejects.toThrow();
      } finally {
        hold.release();
      }
      expect((await writing)?.failed).toHaveLength(1);
      await closing;
      expect(disposed).toBe(1);
      expect(attempts(sia.mock, "pin")).toHaveLength(1);
    } finally {
      uppy.destroy();
      await access.dispose();
      await sdk.close();
    }
  },
);
