/** Runs the delivery checker against disposable package files, never workspace imports. */
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, beforeEach, expect, test } from "vitest";

let temp: string;
let packed: string;
beforeEach(async () => {
  temp = await mkdtemp(join(tmpdir(), "sia-delivery-test-"));
  packed = join(temp, "package");
  await mkdir(packed);
  await cp("README.md", join(packed, "README.md"));
  await cp("docs", join(packed, "docs"), { recursive: true });
  const metadata = JSON.parse(await readFile("package.json", "utf8")) as {
    exports: Record<string, unknown>;
  };
  await writeFile(join(packed, "package.json"), JSON.stringify(metadata));
  const files: Record<string, string> = {
    "client.d.ts": `
      import type { MockConnection } from "./http.js";
      import type { OwnerPort, TestFile } from "./mock.js";
      export type { ReadObject, ReadPort } from "./mock.js";
      declare const applicationBrand: unique symbol;
      export interface ApplicationObject { id: string; readonly [applicationBrand]: true; }
      export type ShareOperation = "add" | "remove" | "end";
      declare const shareBrand: unique symbol;
      export interface ApplicationShareRef { readonly [shareBrand]: true; }
      export interface ApplicationShareTarget { ref: ApplicationShareRef; label: string; operations: readonly ShareOperation[]; }
      export interface ShareInspection { state: "active" | "expired" | "ended"; contains: boolean | null; }
      export interface ApplicationShares {
        targets(): Promise<readonly ApplicationShareTarget[]>;
        inspect(ref: ApplicationShareRef, objectId: string | null): Promise<ShareInspection>;
        add(ref: ApplicationShareRef, object: ApplicationObject): Promise<void>;
        remove(ref: ApplicationShareRef, objectId: string): Promise<void>;
        end(ref: ApplicationShareRef): Promise<void>;
      }
      export declare function createMockApplication(connection: MockConnection, credential: MockCredential): {
        shares: ApplicationShares;
        upload(input: {file: TestFile; name?: string | undefined; metadata: Uint8Array}): Promise<ApplicationObject>;
        inspect(object: ApplicationObject): Promise<"missing" | "uploaded" | "pinned">;
        pin(object: ApplicationObject, options?: { metadata?: Uint8Array | undefined; signal?: AbortSignal }): Promise<void>;
        delete(object: ApplicationObject): Promise<void>;
        events(input: {cursor: null | {after: string; id: string}; limit: number}): Promise<{nextCursor: null | {after: string; id: string}}>;
        close(): Promise<void>;
      };
      export declare function createMockOwnerShares(connection: MockConnection, credential: MockCredential): OwnerPort;
      export interface MockCredential { kind: "app-key"; keyHex: string; }
      export declare function createMockReader(connection: MockConnection, credential: MockCredential): {
        object(id: string): Promise<{id: string; sizeBytes: number}>;
        close(): Promise<void>;
      };`,
    "client.js": `export const createMockApplication = (connection) => {
      const mock = connection.mock;
      const grant = connection.shareGrants?.[0];
      return {
        shares: {
          targets: async () => grant && !grant.revoked ? [{ref: grant, label: grant.label, operations: grant.operations}] : [],
          add: async (ref, object) => { ref.share.objects.push(object); mock.reply("share-add"); },
          remove: async (ref, id) => { ref.share.objects = ref.share.objects.filter(object => object.id !== id); mock.reply("share-remove"); },
          end: async ref => { ref.share.ended = true; mock.reply("share-end"); },
          inspect: async (ref, id) => ({ state: ref.share.ended ? "ended" : "active", contains: ref.share.ended || id === null ? null : ref.share.objects.some(object => object.id === id) })
        },
        upload: async ({file}) => {
          file.open();
          const object = {id: String(mock.data.size), state: "uploaded"};
          mock.data.set(object.id, object);
          const row = { actor: connection.actor, operation: "upload", objectId: object.id, committed: true, status: "completed" };
          mock.rows.push(row);
          try { mock.reply("upload"); } catch (error) { row.status = "failed"; throw error; }
          return object;
        },
        inspect: async (object) => { if (mock.data.get(object.id) !== object) throw Object.assign(new Error("Foreign object"), { code: "foreign-handle" }); return object.state; },
        pin: async (object) => { object.state = "pinned"; },
        delete: async (object) => { object.state = "missing"; mock.reply("delete"); },
        events: async () => ({events: mock.published || [], nextCursor: null}),
        close: async () => {}
      };
    };
    export const createMockOwnerShares = (connection) => connection.mock.ownerShares();
    export const createMockReader = (connection) => ({
      object: async (id) => connection.mock.data.get(id),
      download: async (object) => new Blob([object.bytes]).stream(), close: async () => {}
    });`,
    "http.d.ts": `
      import type { MockSia } from "./mock.js";
      import type { MockCredential } from "./client.js";
      export interface MockConnection { credential: MockCredential; mock: MockSia; }
      export declare function startMockServer(mock: MockSia): Promise<{
        close(): Promise<void>;
        connection(input: {access: object; as: object; shareGrants?: readonly import("./mock.js").MockShareGrant[]}): MockConnection;
      }>;`,
    "http.js": `import "node:http"; export const startMockServer = async (mock) => ({close: async () => {}, connection: input => ({mock, actor: input.as, shareGrants: input.shareGrants, credential: {kind: "app-key", keyHex: "a".repeat(64)}})});`,
    "mock.d.ts": `
      export type { ApplicationObject } from "./client.js";
      export interface PinReplySelector { actor: object; operation: "pin"; object?: import("./client.js").ApplicationObject; }
      export type MutationReplySelector = { actor: object } & (
        { operation: "pin" | "delete"; object?: import("./client.js").ApplicationObject; share?: never } |
        { operation: "share-add" | "share-remove" | "share-end"; share?: MockShareGrant; object?: never } |
        { operation: "upload"; object?: never; share?: never }
      );
      export interface TestFile { name: string; sizeBytes: number; }
      declare const fixtureBrand: unique symbol;
      export interface TestObject { id: string; sizeBytes: number; readonly [fixtureBrand]: true; }
      export interface OwnerPort {
        list(page: {offset: number; limit: number}): Promise<{items: {ref: object; description: string}[]}>;
        detail(ref: object): Promise<{statistics: {objectCount: number; logicalBytes: number}}>;
        objects(ref: object, page: {offset: number; limit: number}): Promise<{items: {id: string; sizeBytes: number; metadata: Uint8Array}[]}>;
        close(): Promise<void>;
      }
      declare const grantBrand: unique symbol;
      export interface MockShareGrant { readonly [grantBrand]: true; }
      export interface MockRun { shares: {
        grant(share: object, input: {as: object; label: string; operations: readonly import("./client.js").ShareOperation[]; expiresAt?: Date}): Promise<MockShareGrant>;
        revokeGrant(grant: MockShareGrant): Promise<void>;
        create(input: {objects: TestObject[]; description?: string}): Promise<object> }; mock: MockSia; ownerAccess: object; objects: { delete(object: TestObject): Promise<void>; upload(input: {file: TestFile; metadata: Uint8Array; name?: string | undefined}): Promise<TestObject> }; }
      export interface ReadObject { id: string; sizeBytes: number; }
      export interface ReadPort { object(id: string): Promise<ReadObject>; close(): Promise<void>; }
      interface ReadSelector { actor?: object; operation: "download" | "object" | "objects" | "owner-share" | "owner-share-objects" | "owner-shares"; }
      interface MutationSelector { actor?: object; operation: "delete" | "pin" | "upload"; stage: "beforeCommit"; }
      interface Hold { release(): void; started(): Promise<{actorLabel: string}>; cancelled(): Promise<{actorLabel: string}>; }
      declare const packedBrand: unique symbol;
      export interface PackedAppKey { readonly [packedBrand]: "key"; }
      export interface PackedObject { readonly [packedBrand]: "object"; id(): string; updateMetadata(bytes: Uint8Array): void; seal(key: PackedAppKey): void; }
      export interface PackedOptions { dataShards?: number; parityShards?: number; maxBufferedSlabs?: number; }
      export declare class MockPinnedObject {
        constructor(id?: string);
        id(): string;
        metadata(): Uint8Array;
        updateMetadata(bytes: Uint8Array): void;
        free(): void;
      }
      export interface PackedSdk<P extends "node" | "browser"> {
        appKey(): PackedAppKey;
        pinObject(object: PackedObject): Promise<void>;
        updateObjectMetadata(object: PackedObject): Promise<void>;
        close(): Promise<void>;
        uploadPacked(options?: PackedOptions): { add(stream: ReadableStream<Uint8Array>): Promise<P extends "node" ? bigint : number>; finalize(): Promise<PackedObject[]>; };
      }
      export interface MockSia {
        packedSdk<P extends "node" | "browser">(options: { access: object; as: object; platform: P; maxBytes: number; maxObjects: number }): PackedSdk<P>;
        uploadSdk(options: { access: object; as: object; maxBytes: number }): { upload(object: MockPinnedObject, source: ReadableStream<Uint8Array>): Promise<MockPinnedObject>; pinObject(object: MockPinnedObject): Promise<void>; close(): Promise<void> };
        faults: {
          fail(selector: ReadSelector, options: {code: "denied" | "not-found" | "unavailable"; times: number}): void;
          hold(selector: ReadSelector): Hold;
        };
        mutationFaults: {
          fail(selector: MutationSelector, options: {code: "denied" | "unavailable"; times: number}): void;
          hold(selector: MutationSelector): Hold;
          loseReply(selector: MutationReplySelector, options: {times: number}): void;
        };
        history(): readonly {actorLabel: string; operation: ReadSelector["operation"] | MutationSelector["operation"] | "inspect" | "events"}[];
        reader(input: {access: object; as: object}): ReadPort;
        ownerShares(input: {access: object; as: object}): OwnerPort;
        actor(label: string): object;
        run<T>(options: unknown, use: (run: MockRun) => Promise<T>): Promise<{value: T}>;
        close(): Promise<void>;
      }
      export declare function createMockSia(): MockSia;
      export declare function bytesFixture(input: {bytes: Uint8Array; name: string}): Promise<TestFile>;`,
    "mock.js": `
      export class MockPinnedObject {
        constructor(id = "draft") { this.objectId = id; this.bytes = new Uint8Array(); }
        id() { return this.objectId; }
        metadata() { return this.bytes.slice(); }
        updateMetadata(bytes) { this.bytes = bytes.slice(); }
        free() {}
      }
      export async function bytesFixture({bytes, name}) { return {bytes, name, sizeBytes: bytes.length, open: () => new Blob([bytes]).stream()}; }
      export function createMockSia() {
        const data = new Map();
        const losses = new Map();
        const reply = operation => {
          const remaining = losses.get(operation) || 0;
          if (remaining) { losses.set(operation, remaining - 1); throw Object.assign(new Error("Fixture network failure"), {code: operation === "metadata" ? "unavailable" : undefined}); }
        };
        let share;
        const ownerShares = () => ({
          list: async () => ({items: [{ref: {}, description: share.description}]}),
          detail: async () => ({statistics: {objectCount: share.objects.length, logicalBytes: share.objects.reduce((sum, item) => sum + item.sizeBytes, 0)}}),
          objects: async () => ({items: share.objects.map(({id, metadata, sizeBytes}) => ({id, metadata, sizeBytes}))}),
          close: async () => {}
        });
        const mock = { data, application: () => ({
          upload: async ({file, metadata}) => {const id = String(data.size); const object = {id}; data.set(id, {id, bytes: file.bytes, sizeBytes: file.sizeBytes, metadata}); return object;},
          pin: async () => {}, close: async () => {}
        }), uploadSdk: () => ({
          upload: async (draft, stream) => { const bytes = await new Response(stream).bytes(); const id = String(data.size); data.set(id, {id, bytes, sizeBytes: bytes.length, metadata: draft.metadata()}); const object = new MockPinnedObject(id); object.updateMetadata(draft.metadata()); return object; },
          pinObject: async object => { data.get(object.id()).metadata = object.metadata(); },
          close: async () => {}
        }), packedSdk: ({platform}) => {
          const owned = new WeakSet();
          const key = {};
          return {
            appKey: () => key, close: async () => {},
            pinObject: async object => { if (!owned.has(object)) throw Object.assign(new Error("Foreign object"), {code: "foreign-handle"}); },
            updateObjectMetadata: async object => { mock.reply("metadata"); data.get(object.id()).metadata = object.metadata; },
            uploadPacked: () => {
              const inputs = [];
              return {
                add: async stream => { const bytes = await new Response(stream).bytes(); inputs.push(bytes); return platform === "node" ? BigInt(bytes.length) : bytes.length; },
                finalize: async () => inputs.map(bytes => {
                  const id = String(data.size);
                  const object = { id: () => id, updateMetadata(metadata) { object.metadata = metadata; }, seal: () => {} };
                  owned.add(object); data.set(id, {id, bytes, sizeBytes: bytes.length, metadata: new Uint8Array()}); return object;
                })
              };
            }
          };
        }, rows: [], history: () => mock.rows, ownerShares, reader: () => ({ object: async id => data.get(id), download: async (record, range = {}) => new Blob([data.get(record.id).bytes.subarray(range.offset || 0, range.length === undefined ? undefined : (range.offset || 0) + range.length)]).stream(), close: async () => {} }), reply, mutationFaults: { fail: (selector, options) => losses.set(selector.operation, options.times), loseReply: (selector, options) => losses.set(selector.operation, options.times) }, publish: async () => { mock.published = [...data.values()].filter(object => object.state !== "uploaded"); }, actor: () => ({}), close: async () => {}, async run(_options, use) {
          const run = {mock, shares: {create: async (input) => (share = input), grant: async (share, input) => ({share, ...input}), revokeGrant: async grant => { grant.revoked = true; }}, ownerAccess: {}, objects: {async upload({file, metadata}) {
            const object = { id: String(data.size), sizeBytes: file.sizeBytes, metadata, bytes: file.bytes };
            data.set(object.id, object); return object;
          }}};
          return { value: await use(run) };
        }}; return mock;
      }`,
    "msw.d.ts": `import type { HttpHandler } from "msw"; export declare function createMockHandlers(mock: unknown, options: {baseUrl: string}): {handlers: HttpHandler[]};`,
    "msw.js": `import {http} from "msw"; export const createMockHandlers = () => ({handlers: [http.get("*", () => new Response())]});`,
    "node.d.ts": `import type { MockRun } from "./mock.js"; export declare function withSiaRun<T>(options: {backend: {kind: "mock"; app: unknown; payloadStorage?: {kind: "temporary-files"; limits: {maxObjectBytes: number; maxLogicalUploadBytes: number; maxRetainedBytes: number; maxUploadAttempts: number}}}; limits?: {maxLogicalUploadBytes?: number}}, use: (run: MockRun) => Promise<T>): Promise<{value: T}>;`,
    "node.js": `import {createMockSia} from "./mock.js"; export const withSiaRun = async (options, use) => {
      const storage = options.backend?.payloadStorage;
      if (storage && (storage.limits.maxUploadAttempts > 16 || options.limits && options.limits.maxLogicalUploadBytes !== storage.limits.maxLogicalUploadBytes)) throw Error("invalid storage limits");
      const mock = createMockSia();
      if (storage) {
        const packedSdk = mock.packedSdk;
        mock.packedSdk = options => { if (options.platform !== "node") throw Error("Node required"); return packedSdk(options); };
      }
      return mock.run(options, use);
    };`,
    "vitest.d.ts": `import type { TestAPI } from "vitest"; import type { MockRun } from "./mock.js"; export interface SiaTestFixtures { readonly sia: MockRun } export type SiaTest = TestAPI<SiaTestFixtures>; export declare function createSiaTest(options: unknown): SiaTest;`,
    "vitest.js": `import {test} from "vitest"; export const createSiaTest = () => test.extend({ sia: async ({}, use) => { await use({}); } });`,
  };
  for (const [path, content] of Object.entries(files)) {
    const file = join(packed, "dist/esm", path);
    await mkdir(resolve(file, ".."), { recursive: true });
    await writeFile(file, content);
  }
  // Block registry access if the checker regresses to installing dependencies.
  await mkdir(join(temp, "bin"));
  await writeFile(
    join(temp, "bin/npm"),
    "#!/bin/sh\necho 'npm is forbidden in fixture checks' >&2\nexit 99\n",
    { mode: 0o755 },
  );
});
afterEach(async () => {
  await rm(temp, { force: true, recursive: true });
});
async function append(path: string, source: string) {
  const file = join(packed, path);
  await writeFile(file, (await readFile(file, "utf8")) + source);
}
function check(
  args = ["--unpacked", packed],
  script = resolve("scripts/check-package.mjs"),
) {
  const result = spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_PATH: "",
      PATH: `${join(temp, "bin")}:${process.env.PATH}`,
    },
  });
  return { output: result.stdout + result.stderr, status: result.status };
}
test("delivers mock entries without npm installation", () => {
  const result = check();
  expect(result.output).toContain(
    "packed consumer checks passed (7 explicit exports)",
  );
  expect(result.status).toBe(0);
}, 60000);
test("prints help without packing or checking a package", () => {
  const result = check(["--help"]);
  expect(result.status).toBe(0);
  expect(result.output).toContain("--unpacked");
  expect(result.output).not.toContain("npm is forbidden");
});

test("accepts an equals-form unpacked directory without npm installation", () => {
  expect(check([`--unpacked=${packed}`]).status).toBe(0);
}, 60000);

test.each([["--unknown"], ["unexpected"], ["--unpacked"], ["--unpacked="]])(
  "rejects invalid arguments %j before packing",
  (...args) => {
    const result = check(args);
    expect(result.status).not.toBe(0);
    expect(result.output).not.toContain("npm is forbidden");
  },
);

test("executes the copied consumer fixture", async () => {
  const checkout = join(temp, "checkout");
  await cp("scripts", join(checkout, "scripts"), { recursive: true });
  await symlink(resolve("node_modules"), join(checkout, "node_modules"), "dir");
  const fixtures = join(checkout, "scripts/package-consumer");
  await mkdir(fixtures, { recursive: true });
  await writeFile(
    join(fixtures, "without-msw.mjs.fixture"),
    'throw new Error("consumer-fixture-executed");',
  );
  const result = check(
    ["--unpacked", packed],
    join(checkout, "scripts/check-package.mjs"),
  );
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("consumer-fixture-executed");
}, 60000);

test("rejects dependency names that escape the consumer", async () => {
  const file = join(packed, "package.json");
  const metadata = JSON.parse(await readFile(file, "utf8")) as {
    dependencies: Record<string, string>;
  };
  metadata.dependencies = { "../outside": "1.0.0" };
  await writeFile(file, JSON.stringify(metadata));
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("invalid dependency name");
}, 60000);

test("rejects a packed package with an unexpected name", async () => {
  const file = join(packed, "package.json");
  const metadata = JSON.parse(await readFile(file, "utf8")) as { name: string };
  metadata.name = "../../outside-consumer";
  await writeFile(file, JSON.stringify(metadata));
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("unexpected package name");
}, 60000);

test("rejects a missing string export target", async () => {
  const file = join(packed, "package.json");
  const metadata = JSON.parse(await readFile(file, "utf8")) as {
    exports: Record<string, unknown>;
  };
  metadata.exports["./package.json"] = "./missing.json";
  await writeFile(file, JSON.stringify(metadata));
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("missing packed target ./missing.json");
}, 60000);
test("compiles declaration dependencies rather than checking only entry files", async () => {
  await append(
    "dist/esm/mock.d.ts",
    '\nexport { Missing } from "./missing-types.js";\n',
  );
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("missing-types.js");
}, 60000);
test.each([
  "node:fs",
  "@siafoundation/sia-storage",
  "vitest",
  "@playwright/test",
])(
  "rejects the transitive browser dependency %s",
  async (dependency) => {
    await append("dist/esm/client.js", '\nimport "./forbidden.js";\n');
    await writeFile(
      join(packed, "dist/esm/forbidden.js"),
      `if (typeof window !== "undefined") void import(${JSON.stringify(dependency)});\n`,
    );
    const result = check();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain(
      `forbidden browser dependency ${dependency}`,
    );
  },
  60000,
);
test("rejects a declaration that breaks the typed consumer", async () => {
  await writeFile(
    join(packed, "dist/esm/mock.d.ts"),
    "export declare const createMockSia: number; export declare function bytesFixture(input: unknown): Promise<unknown>;",
  );
  const result = check();
  expect(result.status).not.toBe(0);
  expect(result.output).toContain("This expression is not callable");
}, 60000);
test.each(["msw.js", "vitest.js"])(
  "rejects %s when it no longer requires the optional peer",
  async (entry) => {
    await writeFile(
      join(packed, "dist/esm", entry),
      "export const placeholder = true;\n",
    );
    const result = check();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("must require the optional");
  },
  60000,
);
test.each(["msw.js", "vitest.js"])(
  "imports %s with the installed peer",
  async (entry) => {
    await append(
      `dist/esm/${entry}`,
      '\nthrow new Error("peer-present-entry-executed");\n',
    );
    const result = check();
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("peer-present-entry-executed");
  },
  60000,
);

test("rejects a Node entrypoint that imports checkout source by absolute path", async () => {
  const external = join(temp, "checkout-only.mjs");
  await writeFile(external, "export const privateSource = true;");
  await append("dist/esm/http.js", `\nimport ${JSON.stringify(external)};\n`);
  const result = check();
  expect(result.status).toBe(1);
  expect(result.output).toContain("outside packed package");
}, 60000);

test.each(["@siafoundation/sia-storage", "vite", "vitest", "@playwright/test"])(
  "rejects a lazy Node entrypoint runtime dependency on %s",
  async (dependency) => {
    await append(
      "dist/esm/http.js",
      `\nexport const load = () => import(${JSON.stringify(dependency)});\n`,
    );
    const result = check();
    expect(result.status).toBe(1);
    expect(result.output).toContain("forbidden HTTP runtime dependency");
  },
  60000,
);

test("rejects a Node declaration that resolves checkout-only types", async () => {
  const external = join(temp, "checkout-only.d.ts");
  await writeFile(
    external,
    "export interface CheckoutOnly { privateSource: true }",
  );
  await append(
    "dist/esm/http.d.ts",
    `\nexport type { CheckoutOnly } from ${JSON.stringify(external)};\n`,
  );
  const result = check();
  expect(result.status).toBe(1);
  expect(result.output).toContain("declaration outside packed consumer");
}, 60000);

test("rejects Node-shaped counts advertised as browser packed counts", async () => {
  const file = join(packed, "dist/esm/mock.d.ts");
  const original = await readFile(file, "utf8");
  await writeFile(
    file,
    original.replace('P extends "node" ? bigint : number', "bigint"),
  );
  const result = check();
  expect(result.status).toBe(1);
  expect(result.output).toContain(
    "Type 'bigint' is not assignable to type 'number'",
  );
}, 60000);
