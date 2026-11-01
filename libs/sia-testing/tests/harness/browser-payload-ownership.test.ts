/** SDK-boundary doubles model WASM consumption without starting browser transport. */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Builder, type Sdk } from "@siafoundation/sia-storage";
import {
  payloadChecks,
  type PayloadConnection,
  withPinnedObjects,
} from "../e2e/browser/app/payload-checks.js";
import { referenceChecks } from "../e2e/browser/app/reference-checks.js";
import { accountingChecks } from "../e2e/browser/app/accounting-checks.js";

const boundary = vi.hoisted(() => ({
  connected: undefined as Sdk | undefined,
  failBuilder: false,
  objects: [] as { consumed: boolean; free: () => void; freed: number }[],
}));
vi.mock("@siafoundation/sia-storage", () => {
  class ObjectHandle {
    consumed = false;
    data: Uint8Array = new Uint8Array();
    freed = 0;
    constructor() {
      boundary.objects.push(this);
    }
    free() {
      if (this.consumed) throw new Error("Consumed handle freed");
      this.freed++;
    }
    id() {
      return "object";
    }
    metadata() {
      return this.data;
    }
    truncate() {
      return new ObjectHandle();
    }
    updateMetadata(bytes: Uint8Array) {
      this.data = bytes;
    }
  }
  return {
    AppKey: class {
      free() {
        return;
      }
    },
    Builder: class {
      constructor() {
        if (boundary.failBuilder) throw new Error("builder failed");
      }
      connected() {
        return Promise.resolve(boundary.connected);
      }
      free() {
        return;
      }
      register() {
        return Promise.resolve({
          account: vi.fn().mockResolvedValue({ pinnedData: 0, pinnedSize: 0 }),
          appKey: vi.fn(),
          createSharingKey: vi.fn(() =>
            Promise.resolve({
              free() {
                return;
              },
              seed() {
                return "seed";
              },
            }),
          ),
          deleteObject: vi.fn().mockResolvedValue(undefined),
          download: vi.fn(
            () =>
              new ReadableStream({
                start(controller) {
                  controller.enqueue(new Uint8Array([2, 3, 4]));
                  controller.close();
                },
              }),
          ),
          free: vi.fn(),
          object: vi.fn(() => Promise.resolve(new ObjectHandle())),
          pinObject: vi.fn().mockResolvedValue(undefined),
          pruneSlabs: vi.fn().mockResolvedValue(undefined),
          shareObject: vi.fn(),
          updateObjectMetadata: vi.fn().mockResolvedValue(undefined),
          upload: vi.fn(
            async (
              object: ObjectHandle,
              stream: ReadableStream<Uint8Array>,
            ) => {
              object.consumed = true;
              const reader = stream.getReader();
              try {
                while (!(await reader.read()).done) {
                  /* Drain the owned source. */
                }
              } finally {
                reader.releaseLock();
              }
              return new ObjectHandle();
            },
          ),
          uploadPacked: vi.fn(() => ({
            add: vi.fn().mockResolvedValue(0),
            finalize: vi.fn(() =>
              Promise.resolve([new ObjectHandle(), new ObjectHandle()]),
            ),
            free: vi.fn(),
          })),
        });
      }
    },
    initSia: () => Promise.resolve(),
    openStreams: vi.fn(),
    PinnedObject: ObjectHandle,
    setLogger: vi.fn(),
    SharedSdk: {
      connect: vi.fn(() =>
        Promise.resolve({
          free() {
            return;
          },
          object: () => Promise.resolve(new ObjectHandle()),
        }),
      ),
    },
    SharingKey: class {
      free() {
        return;
      }
      seed() {
        return "seed";
      }
    },
  };
});
const connection: PayloadConnection = {
  appMeta: {
    appId: "test",
    callbackUrl: undefined,
    description: "",
    logoUrl: undefined,
    name: "",
    serviceUrl: "",
  },
  indexerUrl: "http://localhost",
};
let sdk: Sdk;
beforeEach(async () => {
  boundary.objects.length = 0;
  boundary.failBuilder = false;
  boundary.connected = undefined;
  sdk = await new Builder(connection.indexerUrl, connection.appMeta).register(
    "offline boundary",
  );
});

describe("browser named operations", () => {
  it("rejects payload and accounting access before owner registration", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", { querySelector: () => ({ textContent: "" }) });
    try {
      const { probe } = await import("../e2e/browser/app/real-probe.js");
      expect(() => probe.payload).toThrow("Owner SDK is not connected");
      expect(() => probe.accounting).toThrow("Owner SDK is not connected");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("releases every finalized packed object when the first pin fails", async () => {
    const packed = sdk.uploadPacked();
    vi.spyOn(sdk, "uploadPacked").mockReturnValue(packed);
    vi.spyOn(sdk, "pinObject").mockRejectedValue(new Error("pin failed"));
    await expect(
      payloadChecks(sdk, connection).uploadPackedAndRead([[10], [20]]),
    ).rejects.toThrow("pin failed");
    expect(boundary.objects.map((object) => object.freed)).toEqual([1, 1]);
    expect(vi.spyOn(packed, "free")).not.toHaveBeenCalled();
  });

  it("releases upload results and fetched objects after a successful read without closing the SDK", async () => {
    expect(
      await payloadChecks(sdk, connection).uploadAndRead([1], "ordinary"),
    ).toEqual({ bytes: [2, 3, 4], metadata: "" });
    expect(
      boundary.objects.map((object) => [object.consumed, object.freed]),
    ).toEqual([
      [true, 0],
      [false, 1],
      [false, 1],
    ]);
    expect(vi.spyOn(sdk, "free")).not.toHaveBeenCalled();
  });

  it("does not free a tracked input consumed by a rejected upload", async () => {
    vi.spyOn(sdk, "upload").mockImplementation(() => {
      const input = boundary.objects[0];
      if (!input) throw new Error("Missing upload input");
      input.consumed = true;
      vi.spyOn(input, "free");
      return Promise.reject(new Error("upload failed"));
    });
    await expect(
      payloadChecks(sdk, connection).uploadAndRead([1], ""),
    ).rejects.toThrow("upload failed");
    expect(boundary.objects).toHaveLength(1);
    expect(boundary.objects[0]?.free).not.toHaveBeenCalled();
  });

  it("attempts every object release when a release throws", async () => {
    const first = await sdk.object("first");
    const second = await sdk.object("second");
    vi.spyOn(first, "free").mockImplementation(() => {
      throw new Error("free failed");
    });
    await expect(
      withPinnedObjects(sdk, ({ own }) => {
        own(first);
        own(second);
        return Promise.resolve();
      }),
    ).rejects.toThrow("Object cleanup failed");
    expect(boundary.objects.map((object) => object.freed)).toEqual([0, 1]);
  });

  it("keeps the operation error when object cleanup throws", async () => {
    const first = await sdk.object("first");
    const second = await sdk.object("second");
    vi.spyOn(first, "free").mockImplementation(() => {
      throw new Error("free failed");
    });
    const primary = new Error("operation failed");
    const failure: unknown = await withPinnedObjects(sdk, ({ own }) => {
      own(first);
      own(second);
      return Promise.reject(primary);
    }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError))
      throw new Error("Missing aggregate");
    expect(failure.errors[0]).toBe(primary);
    expect(String(failure.errors[1])).toContain("free failed");
    expect(boundary.objects.map((object) => object.freed)).toEqual([0, 1]);
  });

  it("does not free the consumed input after upload rejects", async () => {
    expect(await payloadChecks(sdk, connection).uploadFailingSource()).toEqual({
      rejected: true,
      sourceError: true,
    });
    expect(
      boundary.objects.map((object) => [object.consumed, object.freed]),
    ).toEqual([[true, 0]]);
  });

  it("does not free the consumed packed handle after finalize rejects", async () => {
    const packed = sdk.uploadPacked();
    vi.spyOn(packed, "finalize").mockRejectedValue(
      new Error("finalize failed"),
    );
    vi.spyOn(sdk, "uploadPacked").mockReturnValue(packed);
    await expect(
      payloadChecks(sdk, connection).uploadPackedAndRead([[1]]),
    ).rejects.toThrow("finalize failed");
    expect(vi.spyOn(packed, "free")).not.toHaveBeenCalled();
  });

  it("frees the packed handle when adding a source fails before finalize", async () => {
    const packed = sdk.uploadPacked();
    vi.spyOn(packed, "add").mockRejectedValue(new Error("add failed"));
    vi.spyOn(sdk, "uploadPacked").mockReturnValue(packed);
    await expect(
      payloadChecks(sdk, connection).uploadPackedAndRead([[1]]),
    ).rejects.toThrow("add failed");
    expect(vi.spyOn(packed, "free")).toHaveBeenCalledOnce();
    expect(vi.spyOn(packed, "finalize")).not.toHaveBeenCalled();
  });

  it.each(["payload", "accounting"] as const)(
    "preserves the %s add error when packed cleanup also fails",
    async (kind) => {
      const packed = sdk.uploadPacked();
      vi.spyOn(packed, "add").mockRejectedValue(new Error("add failed"));
      vi.spyOn(packed, "free").mockImplementation(() => {
        throw new Error("free failed");
      });
      vi.spyOn(sdk, "uploadPacked").mockReturnValue(packed);
      const operation =
        kind === "payload"
          ? payloadChecks(sdk, connection).uploadPackedAndRead([[1], [2]])
          : accountingChecks(sdk).packedReferences([[1], [2]]);
      await expect(operation).rejects.toThrow("add failed");
    },
  );

  it("releases accounting objects on a repeated pin failure", async () => {
    vi.spyOn(sdk, "pinObject")
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("repin failed"));
    await expect(accountingChecks(sdk).repin([1])).rejects.toThrow(
      "repin failed",
    );
    expect(
      boundary.objects.map((object) => [object.consumed, object.freed]),
    ).toEqual([
      [true, 0],
      [false, 1],
    ]);
  });
});

it("retries quota rejection and repeats an imported pin without changing charges or metadata", async () => {
  const destination = await new Builder(
    connection.indexerUrl,
    connection.appMeta,
  ).register("destination");
  let pinGate: Promise<void> | undefined;
  let allowed = false,
    charges = 0,
    metadata = "";
  vi.spyOn(destination, "pinObject").mockImplementation(async (object) => {
    if (!allowed) throw new Error("quota exceeded");
    await pinGate;
    if (!charges) charges = 6;
    metadata = new TextDecoder().decode(object.metadata());
  });
  vi.spyOn(sdk, "object").mockImplementation(async () => {
    const object = await destination.object("owner");
    object.updateMetadata(new TextEncoder().encode("owner"));
    return object;
  });
  vi.spyOn(destination, "object").mockImplementation(async () => {
    const object = new (
      await import("@siafoundation/sia-storage")
    ).PinnedObject();
    object.updateMetadata(new TextEncoder().encode(metadata));
    return object;
  });
  const reference = referenceChecks(
    sdk,
    destination,
    connection,
    () => undefined,
  );
  try {
    await expect(reference.import(false)).rejects.toThrow("not prepared");
    await reference.prepare();
    await expect(reference.import(false)).rejects.toThrow("quota exceeded");
    expect(charges).toBe(0);
    allowed = true;
    let resume!: () => void;
    pinGate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    const retry = reference.import(false);
    await expect(reference.import(false)).rejects.toThrow("already pending");
    resume();
    expect(await retry).toEqual({
      destinationMetadata: "destination",
      ownerMetadata: "owner",
    });
    expect(await reference.import(false)).toEqual({
      destinationMetadata: "destination",
      ownerMetadata: "owner",
    });
    expect(charges).toBe(6);
  } finally {
    reference.close();
  }
  await expect(reference.import(false)).rejects.toThrow("not prepared");
});

function errors(error: unknown): unknown[] {
  return error instanceof AggregateError
    ? error.errors.flatMap(errors)
    : [error];
}
it.each([false, true])(
  "releases reconnect resources and keeps errors when builder construction fails %s",
  async (partial) => {
    const { AppKey } = await import("@siafoundation/sia-storage");
    const key = new AppKey(new Uint8Array(32));
    const released: string[] = [];
    vi.spyOn(key, "free").mockImplementation(() => {
      released.push("key");
      throw new Error("key release");
    });
    vi.spyOn(sdk, "appKey").mockReturnValue(key);
    vi.spyOn(Builder.prototype, "free").mockImplementation(() => {
      released.push("builder");
      throw new Error("builder release");
    });
    if (partial) boundary.failBuilder = true;
    else {
      boundary.connected = await new Builder(
        connection.indexerUrl,
        connection.appMeta,
      ).register("reconnect");
      vi.spyOn(boundary.connected, "object").mockRejectedValue(
        new Error("read failed"),
      );
      vi.spyOn(boundary.connected, "free").mockImplementation(() => {
        released.push("connected");
        throw new Error("connected release");
      });
    }
    const failure: unknown = await payloadChecks(sdk, connection)
      .reconnectAndRead([1])
      .catch((error: unknown) => error);
    expect(errors(failure).map(String)).toEqual(
      partial
        ? ["Error: builder failed", "Error: key release"]
        : [
            "Error: read failed",
            "Error: connected release",
            "Error: builder release",
            "Error: key release",
          ],
    );
    expect(released).toEqual(
      partial ? ["key"] : ["connected", "builder", "key"],
    );
    vi.restoreAllMocks();
  },
);
it.each([false, true])(
  "releases sharing resources and keeps errors when recipient construction fails %s",
  async (partial) => {
    const { SharedSdk } = await import("@siafoundation/sia-storage");
    const key = await sdk.createSharingKey("offline");
    const released: string[] = [];
    vi.spyOn(key, "seed").mockReturnValue("seed");
    vi.spyOn(key, "free").mockImplementation(() => {
      released.push("key");
      throw new Error("key release");
    });
    vi.spyOn(sdk, "createSharingKey").mockResolvedValue(key);
    vi.spyOn(sdk, "shareObject").mockResolvedValue(undefined);
    const shared = await SharedSdk.connect(connection.indexerUrl, "seed");
    vi.spyOn(shared, "object").mockRejectedValue(new Error("read failed"));
    vi.spyOn(shared, "free").mockImplementation(() => {
      released.push("recipient");
      throw new Error("recipient release");
    });
    vi.spyOn(SharedSdk, "connect").mockImplementation(() =>
      partial
        ? Promise.reject(new Error("connect failed"))
        : Promise.resolve(shared),
    );
    const failure: unknown = await payloadChecks(sdk, connection)
      .revokeAndReadRetained([1])
      .catch((error: unknown) => error);
    expect(errors(failure).map(String)).toEqual(
      partial
        ? ["Error: connect failed", "Error: key release"]
        : [
            "Error: read failed",
            "Error: recipient release",
            "Error: key release",
          ],
    );
    expect(released).toEqual(partial ? ["key"] : ["recipient", "key"]);
    vi.restoreAllMocks();
  },
);
it.each([false, true])(
  "releases stream resources and keeps errors when URL construction fails %s",
  async (partial) => {
    const { openStreams } = await import("@siafoundation/sia-storage");
    const released: string[] = [];
    vi.mocked(openStreams).mockReturnValue({
      close() {
        released.push("session");
        throw new Error("session release");
      },
      download: () => Promise.resolve("cancelled"),
      url: () => {
        if (partial) return Promise.reject(new Error("url failed"));
        return Promise.resolve({
          release() {
            released.push("url");
            throw new Error("url release");
          },
          url: "http://localhost/offline",
          warm: () => Promise.resolve(),
        });
      },
    });
    vi.stubGlobal("fetch", () => Promise.reject(new Error("fetch failed")));
    try {
      const failure: unknown = await payloadChecks(sdk, connection)
        .streamRange([1], "bytes=0-0")
        .catch((error: unknown) => error);
      expect(errors(failure).map(String)).toEqual(
        partial
          ? ["Error: url failed", "Error: session release"]
          : [
              "Error: fetch failed",
              "Error: url release",
              "Error: session release",
            ],
      );
      expect(released).toEqual(partial ? ["session"] : ["url", "session"]);
    } finally {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  },
);
