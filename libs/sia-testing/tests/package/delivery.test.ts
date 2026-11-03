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
  const metadata = JSON.parse(await readFile("package.json", "utf8")) as {
    exports: Record<string, unknown>;
  };
  await writeFile(join(packed, "package.json"), JSON.stringify(metadata));
  const files: Record<string, string> = {
    "client.d.ts": `
      import type { MockConnection } from "./http.js";
      import type { OwnerPort } from "./mock.js";
      export declare function createMockOwnerShares(connection: MockConnection, credential: MockCredential): OwnerPort;
      export interface MockCredential { kind: "app-key"; keyHex: string; }
      export declare function createMockReader(connection: MockConnection, credential: MockCredential): {
        object(id: string): Promise<{id: string; sizeBytes: number}>;
        close(): Promise<void>;
      };`,
    "client.js": `export const createMockOwnerShares = (connection) => connection.mock.ownerShares();
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
        connection(input: {access: object; as: object}): MockConnection;
      }>;`,
    "http.js": `import "node:http"; export const startMockServer = async (mock) => ({close: async () => {}, connection: () => ({mock, credential: {kind: "app-key", keyHex: "a".repeat(64)}})});`,
    "mock.d.ts": `
      export interface TestFile { name: string; sizeBytes: number; }
      export interface TestObject { id: string; sizeBytes: number; }
      export interface OwnerPort {
        list(page: {offset: number; limit: number}): Promise<{items: {ref: object; description: string}[]}>;
        detail(ref: object): Promise<{statistics: {objectCount: number; logicalBytes: number}}>;
        objects(ref: object, page: {offset: number; limit: number}): Promise<{items: {id: string; sizeBytes: number; metadata: Uint8Array}[]}>;
        close(): Promise<void>;
      }
      export interface MockRun { shares: { create(input: {objects: TestObject[]; description?: string}): Promise<object> }; mock: MockSia; ownerAccess: object; objects: { upload(input: {file: TestFile; metadata: Uint8Array; name: string}): Promise<TestObject> }; }
      export interface MockSia { ownerShares(input: {access: object; as: object}): OwnerPort; actor(label: string): object; run<T>(options: unknown, use: (run: MockRun) => Promise<T>): Promise<{value: T}>; close(): Promise<void>; }
      export declare function createMockSia(): MockSia;
      export declare function bytesFixture(input: {bytes: Uint8Array; name: string}): Promise<TestFile>;`,
    "mock.js": `
      export async function bytesFixture({bytes, name}) { return {bytes, name, sizeBytes: bytes.length}; }
      export function createMockSia() {
        const data = new Map();
        let share;
        const ownerShares = () => ({
          list: async () => ({items: [{ref: {}, description: share.description}]}),
          detail: async () => ({statistics: {objectCount: share.objects.length, logicalBytes: share.objects.reduce((sum, item) => sum + item.sizeBytes, 0)}}),
          objects: async () => ({items: share.objects.map(({id, metadata, sizeBytes}) => ({id, metadata, sizeBytes}))}),
          close: async () => {}
        });
        const mock = { data, ownerShares, actor: () => ({}), close: async () => {}, async run(_options, use) {
          const run = {mock, shares: {create: async (input) => (share = input)}, ownerAccess: {}, objects: {async upload({file, metadata}) {
            const object = { id: String(data.size), sizeBytes: file.sizeBytes, metadata, bytes: file.bytes };
            data.set(object.id, object); return object;
          }}};
          return { value: await use(run) };
        }}; return mock;
      }`,
    "msw.d.ts": `import type { HttpHandler } from "msw"; export declare function createMockHandlers(mock: unknown, options: {baseUrl: string}): {handlers: HttpHandler[]};`,
    "msw.js": `import {http} from "msw"; export const createMockHandlers = () => ({handlers: [http.get("*", () => new Response())]});`,
    "node.d.ts": `import type { MockRun } from "./mock.js"; export declare function withSiaRun<T>(options: unknown, use: (run: MockRun) => Promise<T>): Promise<{value: T}>;`,
    "node.js": `import {createMockSia} from "./mock.js"; export const withSiaRun = (options, use) => createMockSia().run(options, use);`,
    "playwright.d.ts": `import {test} from "@playwright/test"; export declare function createSiaTest(options: unknown): typeof test;`,
    "playwright.js": `import {test} from "@playwright/test"; export const createSiaTest = () => test;`,
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
test.each(["msw.js", "playwright.js"])(
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
test.each(["msw.js", "playwright.js"])(
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
