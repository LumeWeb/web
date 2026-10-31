/** Exercises browser ownership at the offline SDK boundary, without transport or funding. */
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const boundary = vi.hoisted(() => ({
  approvalGate: undefined as Promise<void> | undefined,
  expirations: [] as (Date | undefined)[],
  failKeyRelease: false,
  failRelease: false,
  fundingWaits: 0,
  listCalls: 0,
  listFailure: false,
  releases: [] as string[],
  rowReleases: 0,
  shareFailure: false,
  uploadGate: undefined as Promise<void> | undefined,
  uploads: 0,
}));
vi.mock("@siafoundation/sia-storage", () => {
  class Handle {
    consumed = false;
    free() {
      if (this.consumed) throw new Error("Consumed upload input freed");
      boundary.releases.push("object");
      if (boundary.failRelease) throw new Error("object release");
    }
    id() {
      return "fixture";
    }
    metadata() {
      return new Uint8Array();
    }
    size() {
      return 1;
    }
    updateMetadata(_bytes: Uint8Array) {
      /* Metadata is not used by these ownership assertions. */
    }
  }
  return {
    Builder: class {
      connectPreAuthorized() {
        return this.register();
      }
      free() {
        boundary.releases.push("builder");
      }
      register() {
        return Promise.resolve({
          account: () => {
            boundary.fundingWaits++;
            return Promise.resolve({
              accountKey: "registered",
              pinnedData: 1,
              pinnedSize: 1,
              ready: true,
            });
          },
          appKey: () => ({
            free() {
              boundary.releases.push("key");
              if (boundary.failKeyRelease) throw new Error("key release");
            },
            publicKey: () => "registered",
          }),
          createSharingKey: (_name: string, expiration?: Date) => {
            boundary.expirations.push(expiration);
            return Promise.resolve({
              free() {
                boundary.releases.push("sharing key");
                if (boundary.failRelease)
                  throw new Error("sharing key release");
              },
              seed: () => new Uint8Array(),
            });
          },
          deleteObject: () => Promise.resolve(),
          download: () =>
            new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(Uint8Array.of(42));
                controller.close();
              },
            }),
          free() {
            boundary.releases.push("sdk");
          },
          object: () => Promise.resolve(new Handle()),
          pinObject: () => Promise.resolve(),
          shareObject: () =>
            boundary.shareFailure
              ? Promise.reject(new Error("share failed"))
              : Promise.resolve(),
          updateObjectMetadata: () => Promise.resolve(),
          upload: async (input: Handle, stream: ReadableStream<Uint8Array>) => {
            await boundary.uploadGate;
            input.consumed = true;
            boundary.uploads++;
            const reader = stream.getReader();
            try {
              while (!(await reader.read()).done) {
                /* Consume the source like WASM upload. */
              }
            } finally {
              reader.releaseLock();
            }
            return new Handle();
          },
        });
      }
      requestConnection() {
        return Promise.resolve();
      }
      responseUrl() {
        return "http://localhost/approve";
      }
      waitForApproval() {
        return boundary.approvalGate ?? Promise.resolve();
      }
    },
    generateRecoveryPhrase: () => "offline",
    initSia: () => Promise.resolve(),
    PinnedObject: Handle,
    setLogger() {
      /* Logger installation has no transport in this boundary. */
    },
    SharedSdk: class {
      static connect() {
        return Promise.resolve({
          free() {
            boundary.releases.push("recipient");
            if (boundary.failRelease) throw new Error("recipient release");
          },
          object: () => Promise.resolve(new Handle()),
          objectSummaries: () => {
            boundary.listCalls++;
            if (boundary.listFailure && boundary.listCalls === 2)
              return Promise.reject(new Error("summary page failed"));
            return Promise.resolve([
              {
                createdAt: new Date(1),
                free() {
                  boundary.rowReleases++;
                  if (boundary.listFailure)
                    throw new Error("summary row release");
                },
                id: "fixture",
                metadata: new Uint8Array(),
                size: 1,
                updatedAt: new Date(1),
              },
            ]);
          },
        });
      }
    },
  };
});
beforeEach(() => {
  vi.resetModules();
  boundary.releases.length = 0;
  boundary.failRelease = false;
  boundary.shareFailure = false;
  boundary.failKeyRelease = false;
  boundary.uploads = 0;
  boundary.fundingWaits = 0;
  boundary.expirations.length = 0;
  boundary.listCalls = 0;
  boundary.rowReleases = 0;
  boundary.listFailure = false;
  boundary.approvalGate = undefined;
  boundary.uploadGate = undefined;
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", { querySelector: () => ({ textContent: "" }) });
});
async function connected() {
  const { probe } = await import("../e2e/browser/app/real-probe.js");
  await probe.request("http://localhost", "app");
  await probe.connect();
  return probe;
}
it("attempts all owner releases after an object release fails and never retries them", async () => {
  const probe = await connected();
  await probe.upload();
  boundary.releases.length = 0;
  boundary.failRelease = true;
  expect(() => probe.close()).toThrow();
  expect(boundary.releases).toEqual(["object", "sdk", "builder"]);
  expect(() => probe.close()).not.toThrow();
  expect(probe.accountKey()).toBe("registered");
});
it("rejects a second owner request without replacing the owned builder", async () => {
  const probe = await connected();
  await expect(probe.request("http://localhost", "other")).rejects.toThrow();
});
it("rejects replacement of an uploaded fixture", async () => {
  const probe = await connected();
  await probe.upload();
  await expect(probe.upload()).rejects.toThrow();
});
it("rejects a second registration without replacing the owner", async () => {
  const probe = await connected();
  await expect(probe.connect()).rejects.toThrow();
});

it("rejects duplicate reference preparation before another upload", async () => {
  const probe = await connected();
  await probe.requestPeer("peer");
  await probe.registerPeer();
  await probe.prepareReference();
  await expect(probe.prepareReference()).rejects.toThrow();
  expect(boundary.uploads).toBe(1);
});
it("summary cleanup releases its key and upload even when recipient release fails", async () => {
  const { Builder, PinnedObject } = await import("@siafoundation/sia-storage");
  const { summaryChecks } =
    await import("../e2e/browser/app/summary-checks.js");
  const sdk = await new Builder("http://localhost", {
    appId: "test",
    callbackUrl: undefined,
    description: "",
    logoUrl: undefined,
    name: "",
    serviceUrl: "",
  }).register("offline");
  const summary = summaryChecks(sdk, new PinnedObject(), "http://localhost");
  await summary.prepare();
  boundary.releases.length = 0;
  boundary.failRelease = true;
  expect(() => summary.close()).toThrow();
  expect(boundary.releases).toEqual(["recipient", "sharing key", "object"]);
  expect(() => summary.close()).not.toThrow();
});
it("rejects duplicate summary preparation without uploading another object", async () => {
  const { Builder, PinnedObject } = await import("@siafoundation/sia-storage");
  const { summaryChecks } =
    await import("../e2e/browser/app/summary-checks.js");
  const sdk = await new Builder("http://localhost", {
    appId: "test",
    callbackUrl: undefined,
    description: "",
    logoUrl: undefined,
    name: "",
    serviceUrl: "",
  }).register("offline");
  const summary = summaryChecks(sdk, new PinnedObject(), "http://localhost");
  await summary.prepare();
  await expect(summary.prepare()).rejects.toThrow();
  expect(boundary.uploads).toBe(1);
});

async function retained() {
  const { Builder, PinnedObject } = await import("@siafoundation/sia-storage");
  const sdk = await new Builder("http://localhost", {
    appId: "test",
    callbackUrl: undefined,
    description: "",
    logoUrl: undefined,
    name: "",
    serviceUrl: "",
  }).register("offline");
  return { fixture: new PinnedObject(), sdk };
}
it("uses the supplied expiry timestamp without binding snapshot reads to this", async () => {
  const { expiryChecks } = await import("../e2e/browser/app/expiry-checks.js");
  const { fixture, sdk } = await retained();
  const expiry = expiryChecks(sdk, fixture, "http://localhost");
  const prepared = await expiry.prepare(123456);
  expect(boundary.expirations.map((value) => value?.getTime())).toEqual([
    123456,
  ]);
  const { readOwner } = expiry;
  expect(await readOwner()).toEqual({ bytes: [42], owner: prepared.owner });
});
it("expiry cleanup attempts every release and does not retry a failed handle", async () => {
  const { expiryChecks } = await import("../e2e/browser/app/expiry-checks.js");
  const { fixture, sdk } = await retained();
  const expiry = expiryChecks(sdk, fixture, "http://localhost");
  await expiry.prepare();
  boundary.releases.length = 0;
  boundary.failRelease = true;
  expect(() => expiry.close()).toThrow();
  expect(boundary.releases).toEqual(["object", "recipient", "sharing key"]);
  expect(() => expiry.close()).not.toThrow();
});
it("rejects duplicate expiry preparation before creating another sharing key", async () => {
  const { expiryChecks } = await import("../e2e/browser/app/expiry-checks.js");
  const { fixture, sdk } = await retained();
  const expiry = expiryChecks(sdk, fixture, "http://localhost");
  await expiry.prepare();
  await expect(expiry.prepare()).rejects.toThrow();
  expect(boundary.expirations).toHaveLength(1);
});
it("reference helper rejects a duplicate prepare before uploading again", async () => {
  const { referenceChecks } =
    await import("../e2e/browser/app/reference-checks.js");
  const { sdk } = await retained();
  const reference = referenceChecks(
    sdk,
    sdk,
    {
      appMeta: {
        appId: "test",
        callbackUrl: undefined,
        description: "",
        logoUrl: undefined,
        name: "",
        serviceUrl: "",
      },
      indexerUrl: "http://localhost",
    },
    () => {
      boundary.releases.push("disconnect");
    },
  );
  await reference.prepare();
  await expect(reference.prepare()).rejects.toThrow();
  expect(boundary.uploads).toBe(1);
});
it("reference operations reject before preparation", async () => {
  const { referenceChecks } =
    await import("../e2e/browser/app/reference-checks.js");
  const { sdk } = await retained();
  const reference = referenceChecks(
    sdk,
    sdk,
    {
      appMeta: {
        appId: "test",
        callbackUrl: undefined,
        description: "",
        logoUrl: undefined,
        name: "",
        serviceUrl: "",
      },
      indexerUrl: "http://localhost",
    },
    () => {
      boundary.releases.push("disconnect");
    },
  );
  await expect(reference.import(false)).rejects.toThrow("not prepared");
  await expect(reference.finish()).rejects.toThrow("not prepared");
});
it("retains the operation error before an owned cleanup error", async () => {
  const { preservingFailure } =
    await import("../e2e/browser/app/payload-checks.js");
  const primary = new Error("primary");
  const cleanup = new Error("cleanup");
  const result = await preservingFailure(
    () => Promise.reject(primary),
    () => {
      throw cleanup;
    },
  ).catch((error: unknown) => error);
  expect(result).toBeInstanceOf(AggregateError);
  if (!(result instanceof AggregateError))
    throw new Error("Missing error details");
  expect(result.errors).toEqual([primary, cleanup]);
});

it("returns the peer identity separately from waiting for funding", async () => {
  const probe = await connected();
  await probe.requestPeer("peer");
  expect(await probe.registerPeer()).toBe("registered");
  expect(probe.peerAccountKey()).toBe("registered");
  expect(boundary.fundingWaits).toBe(0);
  await probe.waitPeerReady();
  expect(boundary.fundingWaits).toBe(1);
});
it("specialized auth closes the SDK after its key release fails", async () => {
  await import("../e2e/browser/app/auth-probe.js");
  window.__browserAuth.setup("http://localhost", "app");
  await window.__browserAuth.connect([1]);
  boundary.releases.length = 0;
  boundary.failKeyRelease = true;
  expect(() => window.__browserAuth.close()).toThrow();
  expect(boundary.releases).toEqual(["key", "sdk"]);
  expect(() => window.__browserAuth.close()).not.toThrow();
});

it("keeps a summary list error before row cleanup errors", async () => {
  const { summaryChecks } =
    await import("../e2e/browser/app/summary-checks.js");
  const { fixture, sdk } = await retained();
  const summary = summaryChecks(sdk, fixture, "http://localhost");
  await summary.prepare();
  boundary.listFailure = true;
  const result = await summary.list().catch((error: unknown) => error);
  expect(result).toBeInstanceOf(AggregateError);
  if (!(result instanceof AggregateError))
    throw new Error("Missing list and cleanup errors");
  expect(String(result.errors[0])).toContain("summary page failed");
  expect(boundary.rowReleases).toBe(1);
});
it("rejects registration while the first registration is still waiting for approval", async () => {
  const { probe } = await import("../e2e/browser/app/real-probe.js");
  await probe.request("http://localhost", "app");
  let approve!: () => void;
  boundary.approvalGate = new Promise<void>((resolve) => {
    approve = resolve;
  });
  const first = probe.connect();
  const second = probe.connect();
  const finished = Promise.allSettled([first, second]);
  approve();
  expect((await finished).map((value) => value.status)).toEqual([
    "fulfilled",
    "rejected",
  ]);
});
it("retains specialized auth account keys after handle close", async () => {
  await import("../e2e/browser/app/auth-probe.js");
  const auth = window.__browserAuth;
  auth.setup("http://localhost", "app");
  await auth.connect([1]);
  await auth.requestPeer();
  await auth.registerPeer();
  auth.close();
  expect(auth).toHaveProperty("accountKey");
  expect(auth.accountKey()).toBe("registered");
  expect(auth.peerAccountKey()).toBe("registered");
});

afterEach(() => vi.unstubAllGlobals());
it("releases the reference reconnect key when disconnecting the peer fails", async () => {
  const { referenceChecks } =
    await import("../e2e/browser/app/reference-checks.js");
  const { sdk } = await retained();
  const reference = referenceChecks(
    sdk,
    sdk,
    {
      appMeta: {
        appId: "test",
        callbackUrl: undefined,
        description: "",
        logoUrl: undefined,
        name: "",
        serviceUrl: "",
      },
      indexerUrl: "http://localhost",
    },
    () => {
      throw new Error("peer release failed");
    },
  );
  await reference.prepare();
  await reference.import(false);
  boundary.releases.length = 0;
  await expect(reference.finish()).rejects.toThrow("peer release failed");
  expect(boundary.releases).toEqual(["key"]);
  await expect(reference.import(false)).rejects.toThrow("not prepared");
});

it("rejects a second peer registration while approval is pending", async () => {
  const probe = await connected();
  await probe.requestPeer("peer");
  let approve!: () => void;
  boundary.approvalGate = new Promise<void>((resolve) => {
    approve = resolve;
  });
  const results = Promise.allSettled([
    probe.registerPeer(),
    probe.registerPeer(),
  ]);
  approve();
  expect((await results).map((value) => value.status)).toEqual([
    "fulfilled",
    "rejected",
  ]);
});
it("rejects replacing a fixture whose upload is still pending", async () => {
  const probe = await connected();
  let finishUpload!: () => void;
  boundary.uploadGate = new Promise<void>((resolve) => {
    finishUpload = resolve;
  });
  const results = Promise.allSettled([probe.upload(), probe.upload()]);
  finishUpload();
  expect((await results).map((value) => value.status)).toEqual([
    "fulfilled",
    "rejected",
  ]);
  expect(boundary.uploads).toBe(1);
});
it("retains owner identity when releasing the temporary app key fails", async () => {
  const { probe } = await import("../e2e/browser/app/real-probe.js");
  await probe.request("http://localhost", "app");
  boundary.failKeyRelease = true;
  await expect(probe.connect()).rejects.toThrow("key release");
  probe.close();
  expect(probe.accountKey()).toBe("registered");
});
it("retains peer identity when releasing the temporary app key fails", async () => {
  const probe = await connected();
  await probe.requestPeer("peer");
  boundary.failKeyRelease = true;
  await expect(probe.registerPeer()).rejects.toThrow("key release");
  probe.closePeer();
  expect(probe.peerAccountKey()).toBe("registered");
});

// Only package resolution changes here; the consumer keeps its production service.
vi.mock("@lumeweb/sia-video-source/sia", () => {
  const source = "../../../sia-video-source/src/sia-stream-service.ts";
  return import(new URL(source, import.meta.url).href);
});
it.each(["library"])(
  "keeps the %s consumer operation error and every release error",
  async () => {
    const path = "../../../sia-video-source/tests/e2e/page.ts";
    const { consumer } = (await import(
      new URL(path, import.meta.url).href
    )) as {
      consumer: {
        close(): void;
        register(): Promise<void>;
        request(url: string, app: string): Promise<string>;
        run(): Promise<unknown>;
      };
    };
    vi.stubGlobal("window", { recordConsumerAccount: () => Promise.resolve() });
    await consumer.request("http://localhost", "test");
    await consumer.register();
    boundary.releases.length = 0;
    boundary.shareFailure = true;
    boundary.failRelease = true;
    try {
      const failure: unknown = await consumer
        .run()
        .catch((error: unknown) => error);
      const flatten = (error: unknown): unknown[] =>
        error instanceof AggregateError
          ? error.errors.flatMap(flatten)
          : [error];
      expect(flatten(failure).map(String)).toEqual([
        "Error: share failed",
        "Error: sharing key release",
        "Error: object release",
      ]);
      expect(boundary.releases).toEqual(["sharing key", "object"]);
    } finally {
      boundary.failRelease = false;
      consumer.close();
    }
  },
);
