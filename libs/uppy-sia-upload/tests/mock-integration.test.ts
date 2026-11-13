/** Checks Uppy upload and pin decisions against Sia testing's staged application port. */
import { expect, vi } from "vitest";
import Uppy, { type Meta } from "@uppy/core";
import {
  type ApplicationObject,
  type ApplicationPort,
  bytesFixture,
} from "@lumeweb/sia-testing/mock";
import { createSiaTest } from "@lumeweb/sia-testing/vitest";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";
import SiaUpload, {
  type SiaUploadBody,
  SiaUploadUncertainError,
  type UploadAccess,
} from "../src/index.ts";

// The synthetic port models upload and pin effects, not the SDK's native WASM handle rules.
const TestPinnedObject = vi.hoisted(
  () =>
    class {
      freed = false;
      metadata = new Uint8Array();
      object: ApplicationObject | undefined;
      free(): void {
        this.freed = true;
      }
      id(): string {
        if (!this.object) throw new Error("Object has not uploaded");
        return this.object.id;
      }
      updateMetadata(bytes: Uint8Array): void {
        this.metadata = bytes.slice();
      }
    },
);
vi.mock("@siafoundation/sia-storage/wasm", () => ({
  PinnedObject: TestPinnedObject,
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

function createSdkPort(writer: ApplicationPort) {
  const uploaded: ApplicationObject[] = [];
  const sdk = {
    appKey: () => ({
      free: () => undefined,
      publicKey: () => "ed25519:mock-account",
    }),
    async pinObject(object: InstanceType<typeof TestPinnedObject>) {
      if (!object.object) throw new Error("Object has not uploaded");
      await writer.pin(object.object);
    },
    async upload(
      draft: InstanceType<typeof TestPinnedObject>,
      source: ReadableStream<Uint8Array>,
    ) {
      try {
        const bytes = new Uint8Array(await new Response(source).arrayBuffer());
        const file = await bytesFixture({ bytes, name: "browser-file" });
        const object = await writer.upload({ file, metadata: draft.metadata });
        uploaded.push(object);
        const result = new TestPinnedObject();
        result.object = object;
        return result;
      } finally {
        draft.free();
      }
    },
  };
  const access = {
    getSnapshot: () => ({ activeSessionId: "mock-session" }),
    withSession: <T>(work: (sdk: SiaSession) => Promise<T> | T): Promise<T> =>
      Promise.resolve(work(sdk as unknown as SiaSession)),
  } as UploadAccess;
  return { access, uploaded };
}

function makeUppy(
  access: UploadAccess,
  onUncertain?: (error: SiaUploadUncertainError) => void,
) {
  const uppy = new Uppy<Meta, SiaUploadBody>();
  uppy.use(SiaUpload, {
    access,
    ...(onUncertain
      ? { onUncertain: (_file, error) => onUncertain(error) }
      : {}),
    metadata: () => Uint8Array.of(9, 8),
  });
  uppy.addFile({
    data: new File([Uint8Array.of(1, 2, 3)], "document.bin", {
      type: "application/octet-stream",
    }),
    name: "document.bin",
    type: "application/octet-stream",
  });
  return uppy;
}

siaTest(
  "an acknowledged pin makes the uploaded bytes readable",
  async ({ sia }) => {
    const actor = sia.mock.actor("uppy upload");
    const writer = sia.mock.application({ access: sia.ownerAccess, as: actor });
    try {
      const { access, uploaded } = createSdkPort(writer);
      const uppy = makeUppy(access);
      try {
        const successes: string[] = [];
        uppy.on("upload-success", (_file, response) =>
          successes.push(response.body?.objectId ?? ""),
        );
        expect((await uppy.upload())?.failed).toHaveLength(0);
        expect(uploaded).toHaveLength(1);
        expect(successes).toEqual([uploaded[0]!.id]);
        expect(await writer.inspect(uploaded[0]!)).toBe("pinned");
        const reader = sia.mock.reader({
          access: sia.ownerAccess,
          as: sia.mock.actor("owner reader"),
        });
        try {
          const object = await reader.object(uploaded[0]!.id);
          expect([...object.metadata]).toEqual([9, 8]);
          expect([
            ...new Uint8Array(
              await new Response(await reader.download(object)).arrayBuffer(),
            ),
          ]).toEqual([1, 2, 3]);
        } finally {
          await reader.close();
        }
      } finally {
        uppy.destroy();
      }
    } finally {
      await writer.close();
    }
  },
);

siaTest("a failed staged upload can retry before pinning", async ({ sia }) => {
  const actor = sia.mock.actor("uppy upload");
  const writer = sia.mock.application({ access: sia.ownerAccess, as: actor });
  try {
    const { access, uploaded } = createSdkPort(writer);
    const outcomes: SiaUploadUncertainError[] = [];
    const uppy = makeUppy(access, (error) => outcomes.push(error));
    try {
      sia.mock.mutationFaults.fail(
        { actor, operation: "upload", stage: "beforeCommit" },
        { code: "unavailable", times: 1 },
      );
      expect((await uppy.upload())?.failed).toHaveLength(1);
      expect(uploaded).toHaveLength(0);
      expect(outcomes).toHaveLength(0);
      expect((await uppy.retryAll())?.failed).toHaveLength(0);
      expect(uploaded).toHaveLength(1);
      expect(await writer.inspect(uploaded[0]!)).toBe("pinned");
    } finally {
      uppy.destroy();
    }
  } finally {
    await writer.close();
  }
});

siaTest(
  "a lost pin reply keeps the committed object and blocks retry",
  async ({ sia }) => {
    const actor = sia.mock.actor("uppy upload");
    const writer = sia.mock.application({ access: sia.ownerAccess, as: actor });
    try {
      const { access, uploaded } = createSdkPort(writer);
      const outcomes: SiaUploadUncertainError[] = [];
      const uppy = makeUppy(access, (error) => outcomes.push(error));
      try {
        sia.mock.mutationFaults.loseReply(
          { actor, operation: "pin" },
          { times: 1 },
        );
        expect((await uppy.upload())?.failed).toHaveLength(1);
        expect(uploaded).toHaveLength(1);
        expect(outcomes[0]?.objectId).toBe(uploaded[0]!.id);
        expect(await writer.inspect(uploaded[0]!)).toBe("pinned");
        await uppy.retryAll();
        expect(uploaded).toHaveLength(1);
        expect(
          sia.mock.history().filter((row) => row.operation === "pin"),
        ).toHaveLength(1);
      } finally {
        uppy.destroy();
      }
    } finally {
      await writer.close();
    }
  },
);
