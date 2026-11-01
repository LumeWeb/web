import { settlePhases } from "../../src/e2e/internal/lifecycle.mjs";
/** Local HTTP fixtures check forwarding without claiming deployed SDK behavior. */
import { createServer, request } from "node:http";
import type { RequestListener, Server } from "node:http";
import { gzipSync } from "node:zlib";
import { lstat, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { afterEach, expect, it } from "vitest";
import { SharedTokenObserver } from "../e2e/support/shared-token-observer.js";
import {
  nativeAppOrigin,
  scopedProxyEnvironment,
  startSharedTokenProxy,
} from "../e2e/native/shared-token-proxy.mjs";
import {
  classifySharingKeyCleanup,
  validateFinalSnapshot,
} from "../e2e/native/shared-token-checks.ts";
import {
  createRecoveryRecord,
  writeRecoveryRecord,
} from "../../src/e2e/internal/recovery.mjs";
import { verifyNativeLease } from "../../src/e2e/internal/owned-cluster-lease.mjs";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
async function fixture(handler: RequestListener) {
  const server = createServer(handler);
  const origin = await listen(server);
  cleanup.push(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  return origin;
}
async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing fixture listener");
  return `http://127.0.0.1:${address.port}`;
}
async function proxy(appOrigin: string, maxBodyBytes?: number, limits = {}) {
  const observer = new SharedTokenObserver(appOrigin);
  const result = await startSharedTokenProxy({
    appOrigin,
    maxBodyBytes,
    observer,
    ...limits,
  });
  cleanup.push(() => result.close());
  return { ...result, observer };
}
function send(proxyURL: string, target: string, headers = {}, method = "GET") {
  return new Promise<{
    body: Buffer;
    headers: Record<string, unknown>;
    status: number;
  }>((resolve, reject) => {
    const req = request(
      proxyURL,
      {
        headers: { host: new URL(target).host, ...headers },
        method,
        path: target,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            body: Buffer.concat(chunks),
            headers: res.headers,
            status: res.statusCode!,
          }),
        );
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end();
  });
}
const key = `ed25519:${"a".repeat(64)}`;
const body = Buffer.from(
  JSON.stringify([
    {
      publicKey: key,
      token: {
        hostKey: key,
        signature: "PRIVATE_SIGNATURE",
        validUntil: "2026-10-27T14:00:00Z",
      },
    },
  ]),
);

it("forwards compressed response bytes and preserves SDK negotiation headers", async () => {
  let received: Record<string, unknown> = {};
  const wire = gzipSync(body);
  const app = await fixture((req, res) => {
    received = {
      accept: req.headers.accept,
      encoding: req.headers["accept-encoding"],
      host: req.headers.host,
      path: req.url,
    };
    res.writeHead(200, {
      "content-encoding": "gzip",
      "content-type": "application/json",
      "x-fixture": "unchanged",
    });
    res.end(wire);
  });
  const p = await proxy(app);
  const response = await send(
    p.url,
    `${app}/shared/hosts?signature=PRIVATE_QUERY`,
    {
      "accept": "application/cbor, application/json",
      "accept-encoding": "gzip, br",
    },
  );
  await p.drain();
  expect(response.status).toBe(200);
  expect(response.body).toEqual(wire);
  expect(response.headers["x-fixture"]).toBe("unchanged");
  expect(received).toEqual({
    accept: "application/cbor, application/json",
    encoding: "gzip, br",
    host: new URL(app).host,
    path: "/shared/hosts?signature=PRIVATE_QUERY",
  });
  expect(p.observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1793109600000,
  );
  expect(JSON.stringify(p.observer.snapshot())).not.toMatch(/PRIVATE/);
});

it("rejects other authorities and CONNECT without contacting their listeners", async () => {
  let calls = 0;
  const app = await fixture((_req, res) => {
    calls++;
    res.end();
  });
  const other = await fixture((_req, res) => {
    calls++;
    res.end();
  });
  const p = await proxy(app);
  expect((await send(p.url, `${other}/api/state`)).status).toBe(403);
  expect(
    (await send(p.url, `${other}/api/state`, { host: new URL(app).host }))
      .status,
  ).toBe(403);
  expect(
    (await send(p.url, `${app}/shared/hosts`, { host: "wrong.invalid" }))
      .status,
  ).toBe(403);
  expect(calls).toBe(0);
  await new Promise<void>((resolve, reject) => {
    const req = request(p.url, { method: "CONNECT", path: new URL(app).host });
    req.on("connect", (res, socket) => {
      expect(res.statusCode).toBe(403);
      socket.destroy();
      resolve();
    });
    req.on("error", reject);
    req.end();
  });
  expect(calls).toBe(0);
});

it("does not inspect unrelated application bodies", async () => {
  const app = await fixture((_req, res) => {
    res.writeHead(207);
    res.end("PRIVATE_NON_JSON");
  });
  const p = await proxy(app);
  const response = await send(p.url, `${app}/other`);
  await p.drain();
  expect(response.status).toBe(207);
  expect(response.body.toString()).toBe("PRIVATE_NON_JSON");
  expect(p.observer.snapshot().observations).toEqual([]);
});

it.each([
  ["unknown encoding", "application/json", "unknown", body, 1024],
  ["unsupported CBOR", "application/cbor", "", Buffer.from([0x80]), 1024],
  [
    "malformed JSON",
    "application/json",
    "",
    Buffer.from("PRIVATE_BAD_JSON"),
    1024,
  ],
  ["oversized copy", "application/json", "", body, 8],
  [
    "oversized decoded copy",
    "application/json",
    "gzip",
    gzipSync(Buffer.alloc(4096, 32)),
    1024,
  ],
])(
  "fails closed with redacted diagnostics for %s",
  async (_name, type, encoding, bytes, limit) => {
    const app = await fixture((_req, res) => {
      res.writeHead(200, {
        "content-encoding": encoding,
        "content-type": type,
      });
      res.end(bytes);
    });
    const p = await proxy(app, limit);
    expect(
      (await send(p.url, `${app}/shared/hosts?signature=PRIVATE_QUERY`)).body,
    ).toEqual(bytes);
    await expect(p.drain()).rejects.toThrow("Shared-host observation failed");
    await p.close();
    await expect(send(p.url, `${app}/shared/hosts`)).rejects.toThrow();
  },
);

it("returns only redacted observations through its private capability", async () => {
  const app = await fixture((_req, res) => {
    res.writeHead(401);
    res.end("PRIVATE_SERVICE_BODY");
  });
  const p = await proxy(app);
  await send(p.url, `${app}/shared/hosts?signature=PRIVATE_QUERY`);
  const denied = await fetch(`${p.url}/observations/wrong`);
  expect(denied.status).toBe(403);
  expect(p.controlURL).toMatch(
    /^http:\/\/127\.0\.0\.1:\d+\/observations\/[a-f0-9]{64}$/,
  );
  const response = await fetch(p.controlURL);
  expect(response.status).toBe(200);
  const text = await response.text();
  expect(text).not.toMatch(/PRIVATE|signature/);
  expect(JSON.parse(text)).toMatchObject({
    conservativeMaximumDeliveredExpiryMs: null,
    observations: [{ kind: "unauthorized", status: 401 }],
  });
});

it.each([
  ["HTTP 404 Not Found: sharing key not found", true, "already-expired"],
  ["HTTP 404 Not Found: sharing key not found", false, "failure"],
  ["HTTP 404 Not Found: account not found PRIVATE", true, "failure"],
  ["HTTP 401 Unauthorized: sharing key not found PRIVATE", true, "failure"],
  ["network failure PRIVATE", true, "failure"],
])(
  "classifies only the exact expired sharing-key not-found contract",
  (message, expired, kind) => {
    expect(classifySharingKeyCleanup(new Error(message), expired)).toBe(kind);
    expect(
      JSON.stringify(classifySharingKeyCleanup(new Error(message), expired)),
    ).not.toContain("PRIVATE");
  },
);

it("keeps exact recovery records in an owned private directory", async () => {
  const path = await createRecoveryRecord();
  expect(path).toMatch(/^\/tmp\/sia-native-cutoff-run-[^/]+\/recovery.json$/);
  cleanup.push(() => rm(dirname(path), { force: true, recursive: true }));
  expect((await lstat(path)).mode & 0o777).toBe(0o600);
  expect((await lstat(dirname(path))).mode & 0o777).toBe(0o700);
  await writeRecoveryRecord(path, {
    connectKey: "PRIVATE_RECOVERY_KEY",
    quotaKey: "literal-known-quota",
  });
  expect(JSON.parse(await readFile(path, "utf8"))).toEqual({
    connectKey: "PRIVATE_RECOVERY_KEY",
    quotaKey: "literal-known-quota",
  });
  await rm(path);
  await symlink(`${path}.unowned`, path);
  await expect(
    writeRecoveryRecord(path, { quotaKey: "wrong" }),
  ).rejects.toThrow("Invalid recovery manifest");
});

it("recognizes an inherited exclusive flock on an owned literal file", async () => {
  const path = await createRecoveryRecord();
  cleanup.push(() => rm(dirname(path), { force: true, recursive: true }));
  const moduleURL = new URL(
    "../../src/e2e/internal/owned-cluster-lease.mjs",
    import.meta.url,
  ).href;
  const program = `import { verifyNativeLease } from ${JSON.stringify(moduleURL)}; console.log(await verifyNativeLease(process.env.FD, process.argv[1]));`;
  const result = await promisify(execFile)("python3", [
    "-c",
    'import fcntl,os,subprocess,sys\nwith open(sys.argv[1],"a") as lock:\n fcntl.flock(lock,fcntl.LOCK_EX)\n os.dup2(lock.fileno(),10)\n sys.exit(subprocess.call(sys.argv[2:],env=dict(os.environ,FD="10"),pass_fds=(10,)))',
    `${path}.lock`,
    process.execPath,
    "--input-type=module",
    "-e",
    program,
    `${path}.lock`,
  ]);
  expect(result.stdout.trim()).toBe("true");
  await expect(verifyNativeLease("999999", `${path}.lock`)).rejects.toThrow();
});

it("rejects an app configuration that selects the admin authority", () => {
  expect(() =>
    nativeAppOrigin("http://127.0.0.1:3001", "http://127.0.0.1:3001/"),
  ).toThrow("App proxy cannot target admin");
  expect(
    nativeAppOrigin("http://127.0.0.1:3002/", "http://127.0.0.1:3001/"),
  ).toBe("http://127.0.0.1:3002");
});

it.each([
  ["http://localhost:3001", "http://127.0.0.1:3001"],
  ["http://[::1]:3001", "http://localhost:3001"],
  ["http://127.0.0.1", "http://localhost:80"],
])(
  "rejects equivalent loopback app and admin listeners by effective port",
  (app, admin) => {
    expect(() => nativeAppOrigin(app, admin)).toThrow(
      "App proxy cannot target admin",
    );
  },
);

it("rejects direct locked-mode entry without an inherited lock descriptor", async () => {
  const script = fileURLToPath(
    new URL("../../scripts/check-native-token-expiry.mjs", import.meta.url),
  );
  const env = { ...process.env };
  delete env.SIA_NATIVE_TOKEN_LOCK_FD;
  const result = await promisify(execFile)(
    process.execPath,
    [script, "--locked", "--scenario=routing"],
    { env },
  ).catch((error: unknown) => {
    if (
      !error ||
      typeof error !== "object" ||
      !("stderr" in error) ||
      typeof error.stderr !== "string"
    )
      throw error;
    return { stderr: error.stderr };
  });
  expect(result.stderr).toContain("failed during lease ownership");
});

it("confines proxy variables to the copied child environment", () => {
  const original = {
    ALL_PROXY: "PRIVATE_ALL",
    HTTP_PROXY: "PRIVATE_OLD_PROXY",
    https_proxy: "PRIVATE_TLS_PROXY",
    KEEP: "value",
    No_Proxy: "*",
  };
  const child = scopedProxyEnvironment(original, "http://127.0.0.1:1234");
  expect(child).toEqual({
    HTTP_PROXY: "http://127.0.0.1:1234",
    http_proxy: "http://127.0.0.1:1234",
    KEEP: "value",
    NO_PROXY: "",
    no_proxy: "",
  });
  expect(original.https_proxy).toBe("PRIVATE_TLS_PROXY");
});

it("closes in-flight sockets when the upstream never finishes", async () => {
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const app = await fixture((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.write("[");
    started();
  });
  const p = await proxy(app);
  const response = send(p.url, `${app}/shared/hosts`).catch(() => "closed");
  await ready;
  await p.close();
  expect(await response).toBe("closed");
  await expect(p.drain()).rejects.toThrow("Shared-host observation failed");
});

it("drains a delayed successful page before reporting its expiry", async () => {
  let finish!: () => void;
  const app = await fixture((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.write(body.subarray(0, 8));
    finish = () => res.end(body.subarray(8));
  });
  const p = await proxy(app);
  const response = send(p.url, `${app}/shared/hosts`);
  while (!finish) await new Promise((resolve) => setTimeout(resolve, 1));
  let drained = false;
  const drain = p.drain().then(() => {
    drained = true;
  });
  await new Promise((resolve) => setTimeout(resolve, 5));
  expect(drained).toBe(false);
  finish();
  await response;
  await drain;
  expect(p.observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1793109600000,
  );
});

it("bounds permanently unfinished observation drainage and freezes closed snapshots", async () => {
  let finish!: () => void;
  const app = await fixture((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.write(body.subarray(0, 8));
    finish = () => res.end(body.subarray(8));
  });
  const p = await proxy(app, undefined, { drainTimeoutMs: 30 });
  const response = send(p.url, `${app}/shared/hosts`).catch(() => undefined);
  while (!finish) await new Promise((resolve) => setTimeout(resolve, 1));
  const outcome = await Promise.race([
    p.drain().then(
      () => "accepted",
      () => "bounded-failure",
    ),
    new Promise((resolve) => setTimeout(() => resolve("hung"), 300)),
  ]);
  expect(outcome).toBe("bounded-failure");
  const before = p.observer.snapshot();
  await p.close();
  finish();
  await response;
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(p.observer.snapshot()).toEqual(before);
});

it.each([
  { maxCaptureBytes: body.length + 1 },
  { maxRecords: 1 },
  { maxResponses: 1 },
])(
  "bounds cumulative observation capture without changing response bytes",
  async (limits) => {
    const app = await fixture((_req, res) => {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(body);
    });
    const p = await proxy(app, undefined, limits);
    expect((await send(p.url, `${app}/shared/hosts`)).body).toEqual(body);
    await p.drain();
    const before = p.observer.snapshot();
    expect((await send(p.url, `${app}/shared/hosts`)).body).toEqual(body);
    await expect(p.drain()).rejects.toThrow("Shared-host observation failed");
    expect(p.observer.snapshot()).toEqual(before);
  },
);

it("rejects a late successful issuance in the final drained snapshot", () => {
  const snapshot = {
    conservativeMaximumDeliveredExpiryMs: 1000,
    observations: [
      {
        hosts: [],
        kind: "delivered" as const,
        requestStartedAtMs: 150,
        responseReceivedAtMs: 200,
        status: 200,
      },
    ],
  };
  expect(() =>
    validateFinalSnapshot(snapshot, {
      authorizationEndedAtMs: 100,
      firstRejectingReadStartedAtMs: 2100,
      maximumDeliveredExpiryMs: 1000,
    }),
  ).toThrow("Invalid final token evidence");
});

it("rejects a larger delivered expiry omitted from child evidence", () => {
  const snapshot = {
    conservativeMaximumDeliveredExpiryMs: 3000,
    observations: [
      {
        hosts: [],
        kind: "delivered" as const,
        requestStartedAtMs: 50,
        responseReceivedAtMs: 200,
        status: 200,
      },
    ],
  };
  expect(() =>
    validateFinalSnapshot(snapshot, {
      authorizationEndedAtMs: 100,
      firstRejectingReadStartedAtMs: 2500,
      maximumDeliveredExpiryMs: 1000,
    }),
  ).toThrow("Invalid final token evidence");
});

it("accepts final unauthorized refreshes after the observed boundary", () => {
  expect(() =>
    validateFinalSnapshot(
      {
        conservativeMaximumDeliveredExpiryMs: 1000,
        observations: [
          {
            hosts: [],
            kind: "delivered",
            requestStartedAtMs: 50,
            responseReceivedAtMs: 80,
            status: 200,
          },
          {
            hosts: [],
            kind: "unauthorized",
            requestStartedAtMs: 150,
            responseReceivedAtMs: 180,
            status: 401,
          },
        ],
      },
      {
        authorizationEndedAtMs: 100,
        firstRejectingReadStartedAtMs: 2001,
        maximumDeliveredExpiryMs: 1000,
      },
    ),
  ).not.toThrow();
});

async function descendantsGone(directory: string) {
  for (const name of ["worker.pid", "grandchild.pid"]) {
    const pid = (await readFile(`${directory}/${name}`, "utf8")).trim();
    expect(
      await lstat(`/proc/${pid}`).then(
        () => true,
        () => false,
      ),
    ).toBe(false);
  }
  const before = await readFile(`${directory}/heartbeat`, "utf8").catch(
    () => "",
  );
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(await readFile(`${directory}/heartbeat`, "utf8").catch(() => "")).toBe(
    before,
  );
  expect(await lockState(`${directory}/lock`)).toBe("available");
}
async function lockState(path: string) {
  const result = await promisify(execFile)("python3", [
    "-c",
    'import fcntl,sys\nwith open(sys.argv[1],"a") as lock:\n try:\n  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB);print("available")\n except BlockingIOError: print("blocked")',
    path,
  ]);
  return result.stdout.trim();
}
async function processFixture(deadlineMs: number, generic = false) {
  const manifest = await createRecoveryRecord();
  const directory = dirname(manifest);
  const script = fileURLToPath(
    new URL("../../scripts/check-native-token-expiry.mjs", import.meta.url),
  );
  const workerPath = `${directory}/worker.mjs`;
  const grandchild = `const fs=require('node:fs');fs.writeFileSync(${JSON.stringify(`${directory}/grandchild-lock`)},String(fs.readFileSync('/proc/self/fdinfo/3','utf8').includes('FLOCK')));fs.writeFileSync(${JSON.stringify(`${directory}/grandchild.pid`)},String(process.pid));process.on('SIGTERM',()=>{});setInterval(()=>fs.appendFileSync(${JSON.stringify(`${directory}/heartbeat`)},'x'),20)`;
  const worker = `import {spawn} from 'node:child_process'; import {readFileSync,writeFileSync} from 'node:fs';
    writeFileSync(${JSON.stringify(directory)}+'/worker-lock',String(readFileSync('/proc/self/fdinfo/'+process.env.SIA_NATIVE_TOKEN_LOCK_FD,'utf8').includes('FLOCK')));
    writeFileSync(${JSON.stringify(directory)}+'/worker.pid',String(process.pid));
    spawn(process.execPath,['-e',${JSON.stringify(grandchild)}],{detached:true,stdio:'ignore'});
    process.on('SIGTERM',()=>{});setInterval(()=>{},1000);`;
  await writeFile(workerPath, worker, { mode: 0o600 });
  const config = `${directory}/fixture.json`;
  await writeFile(
    config,
    JSON.stringify({
      deadlineMs,
      graceMs: 100,
      lockPath: `${directory}/lock`,
      manifestPath: manifest,
      workerPath,
    }),
    { mode: 0o600 },
  );
  const guardianURL = new URL(
    "../../src/e2e/internal/owned-cluster-lease.mjs",
    import.meta.url,
  ).href;
  const genericProgram = `import {runWithGuardian} from ${JSON.stringify(guardianURL)};process.exitCode=await runWithGuardian(process.execPath,[${JSON.stringify(workerPath)}],process.env,true,${JSON.stringify(`${directory}/lock`)},${deadlineMs},100);`;
  const launch = generic
    ? ["--input-type=module", "-e", genericProgram]
    : [script, `--fixture=${config}`];
  const child = spawn(process.execPath, launch, {
    env: { ...process.env, SIA_NATIVE_TOKEN_FIXTURE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk: Buffer) => {
    if (output.length < 32768) output += chunk.toString();
  });
  child.stderr.on("data", (chunk: Buffer) => {
    if (output.length < 32768) output += chunk.toString();
  });
  const completion = new Promise<null | number>((resolve) =>
    child.once("exit", resolve),
  );
  cleanup.push(async () => {
    await completion;
    await rm(directory, { force: true, recursive: true });
  });
  const ready = async () => {
    for (let i = 0; i < 100; i++) {
      if (
        await lstat(`${directory}/grandchild.pid`).then(
          () => true,
          () => false,
        )
      )
        return true;
      if (child.exitCode !== null) return false;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return false;
  };
  const released = promisify(execFile)(
    "python3",
    [
      "-c",
      'import fcntl,os,sys,time\nwhile not os.path.exists(sys.argv[1]+"/grandchild.pid"): time.sleep(.01)\nwith open(sys.argv[1]+"/lock","a") as lock:\n fcntl.flock(lock,fcntl.LOCK_EX)\n print(all(not os.path.exists("/proc/"+open(sys.argv[1]+"/"+name).read().strip()) for name in ("worker.pid","grandchild.pid")))',
      directory,
    ],
    { timeout: 8000 },
  ).catch(() => ({ stdout: "False" }));
  cleanup.push(async () => {
    await released;
  });
  return {
    child,
    completion,
    directory,
    manifest,
    output: () => output,
    ready,
    released,
  };
}
it("covers readiness, cleanup and postflight in the requested working directory", async () => {
  const manifest = await createRecoveryRecord();
  const directory = dirname(manifest);
  cleanup.push(() => rm(directory, { force: true, recursive: true }));
  const guardianURL = new URL(
    "../../src/e2e/internal/owned-cluster-lease.mjs",
    import.meta.url,
  ).href;
  const program = `const fs=require('node:fs');if(process.cwd()!==${JSON.stringify(directory)})process.exit(2);for(const phase of ['readiness','operation','cleanup','postflight']){if(!fs.readFileSync('/proc/self/fdinfo/'+process.env.SIA_NATIVE_TOKEN_LOCK_FD,'utf8').includes('FLOCK'))process.exit(3);fs.appendFileSync('phases',phase+'\\n')}`;
  const launch = `import {runWithGuardian} from ${JSON.stringify(guardianURL)};process.exitCode=await runWithGuardian(process.execPath,['-e',${JSON.stringify(program)}],process.env,true,${JSON.stringify(`${directory}/lock`)},3000,100,${JSON.stringify(directory)});`;
  await promisify(execFile)(process.execPath, [
    "--input-type=module",
    "-e",
    launch,
  ]);
  expect(await readFile(`${directory}/phases`, "utf8")).toBe(
    "readiness\noperation\ncleanup\npostflight\n",
  );
  expect(await lockState(`${directory}/lock`)).toBe("available");
});

it("keeps an operator lease after its Node owner dies until the command tree is reaped", async () => {
  const owned = await processFixture(1200, true);
  expect(await owned.ready(), owned.output()).toBe(true);
  expect(owned.child.kill("SIGKILL")).toBe(true);
  await owned.completion;
  expect(await lockState(`${owned.directory}/lock`)).toBe("blocked");
  expect((await owned.released).stdout.trim()).toBe("True");
  await descendantsGone(owned.directory);
}, 10_000);

it("runs an operator command under a real lease until detached descendants are reaped", async () => {
  const owned = await processFixture(1200, true);
  expect(await owned.ready(), owned.output()).toBe(true);
  expect(await lockState(`${owned.directory}/lock`)).toBe("blocked");
  expect(await readFile(`${owned.directory}/worker-lock`, "utf8")).toBe("true");
  expect(await owned.completion).not.toBe(0);
  expect((await owned.released).stdout.trim()).toBe("True");
  await descendantsGone(owned.directory);
}, 10_000);

it("bounds a hung worker and reaps detached descendants before releasing its real fixture lock", async () => {
  const started = Date.now();
  const owned = await processFixture(1200);
  expect(await owned.ready(), owned.output()).toBe(true);
  expect(await lockState(`${owned.directory}/lock`)).toBe("blocked");
  expect(await readFile(`${owned.directory}/worker-lock`, "utf8")).toBe("true");
  expect(await readFile(`${owned.directory}/grandchild-lock`, "utf8")).toBe(
    "false",
  );
  expect(await owned.completion).not.toBe(0);
  expect((await owned.released).stdout.trim()).toBe("True");
  expect(Date.now() - started).toBeLessThan(3000);
  expect(owned.output()).toContain("owned-process deadline");
  expect(owned.output()).toContain("private-recovery-retained");
  await descendantsGone(owned.directory);
  expect(await readFile(owned.manifest, "utf8")).toContain("fixture-recovery");
}, 10_000);

it("retains the lock through unexpected supervisor death until all owned descendants exit", async () => {
  const owned = await processFixture(3000);
  expect(await owned.ready(), owned.output()).toBe(true);
  expect(await lockState(`${owned.directory}/lock`)).toBe("blocked");
  const identity: unknown = JSON.parse(
    await readFile(`${owned.directory}/supervisor.json`, "utf8"),
  );
  if (
    !identity ||
    typeof identity !== "object" ||
    !("pid" in identity) ||
    !("started" in identity)
  )
    throw new Error("Invalid owned fixture identity");
  await promisify(execFile)("python3", [
    "-c",
    'import os,signal,sys\npid=int(sys.argv[1]);fd=os.pidfd_open(pid)\nstat=open("/proc/%d/stat"%pid).read();assert stat[stat.rfind(")")+2:].split()[19]==sys.argv[2]\nsignal.pidfd_send_signal(fd,signal.SIGKILL)',
    String(identity.pid),
    String(identity.started),
  ]);
  expect(await readFile(`${owned.directory}/worker-lock`, "utf8")).toBe("true");
  expect(await readFile(`${owned.directory}/grandchild-lock`, "utf8")).toBe(
    "false",
  );
  expect(await owned.completion).not.toBe(0);
  expect((await owned.released).stdout.trim()).toBe("True");
  await descendantsGone(owned.directory);
  expect(await readFile(owned.manifest, "utf8")).toContain("fixture-recovery");
}, 10_000);

it("retains business and teardown failures while still attempting postflight", async () => {
  const attempted: string[] = [];
  const business = new Error("literal business failure"),
    postflight = new Error("literal postflight failure"),
    teardown = new Error("literal teardown failure");
  const failures = await settlePhases([
    {
      phase: "business",
      run: async () => {
        attempted.push("business");
        await Promise.reject(business);
      },
    },
    {
      phase: "teardown",
      run: async () => {
        attempted.push("teardown");
        await Promise.reject(teardown);
      },
    },
    {
      phase: "postflight",
      run: async () => {
        attempted.push("postflight");
        await Promise.reject(postflight);
      },
    },
  ]);
  expect(attempted).toEqual(["business", "teardown", "postflight"]);
  expect(failures).toEqual([
    { error: business, phase: "business" },
    { error: teardown, phase: "teardown" },
    { error: postflight, phase: "postflight" },
  ]);
});

it("carries only timestamp evidence over the private child channel", async () => {
  const app = await fixture((_req, res) => {
    res.end();
  });
  const p = await proxy(app);
  const evidence = {
    authorizationEndedAtMs: 100,
    firstRejectingReadStartedAtMs: 2001,
    maximumDeliveredExpiryMs: 1000,
  };
  expect(
    (
      await fetch(p.controlURL, {
        body: JSON.stringify(evidence),
        method: "POST",
      })
    ).status,
  ).toBe(204);
  expect(p.evidence()).toEqual(evidence);
  const rejected = await fetch(p.controlURL, {
    body: JSON.stringify({ ...evidence, token: "PRIVATE" }),
    method: "POST",
  });
  expect(rejected.status).toBe(400);
  expect(p.evidence()).toEqual(evidence);
  await p.close();
  expect(p.evidence()).toEqual(evidence);
});

it("bounds concurrent copies and closes only its owned upstream sockets", async () => {
  let requests = 0;
  const app = await fixture((req, res) => {
    if (req.url === "/ready") {
      res.end("ready");
      return;
    }
    requests++;
    res.writeHead(200, { "content-type": "application/json" });
    res.write(body.subarray(0, 8));
  });
  const p = await proxy(app, undefined, { maxCaptureBytes: 12 });
  const first = send(p.url, `${app}/shared/hosts`).catch(() => undefined);
  const second = send(p.url, `${app}/shared/hosts`).catch(() => undefined);
  while (requests < 2) await new Promise((resolve) => setTimeout(resolve, 1));
  await new Promise((resolve) => setTimeout(resolve, 10));
  await expect(p.drain()).rejects.toThrow("Shared-host observation failed");
  await p.close();
  await Promise.all([first, second]);
  expect(p.observer.snapshot().observations).toEqual([]);
  expect(await (await fetch(`${app}/ready`)).text()).toBe("ready");
});

it("freezes observations after an upstream response aborts", async () => {
  const app = await fixture((_req, res) => {
    res.writeHead(200);
    res.write("[");
    res.destroy();
  });
  const p = await proxy(app);
  await send(p.url, `${app}/shared/hosts`).catch(() => undefined);
  await expect(p.drain()).rejects.toThrow("Shared-host observation failed");
  const before = p.observer.snapshot();
  await p.close();
  expect(p.observer.snapshot()).toEqual(before);
});

it("rejects private child evidence containing anything besides timestamps", async () => {
  const app = await fixture((_req, res) => {
    res.end();
  });
  const p = await proxy(app);
  const response = await fetch(p.controlURL, {
    body: JSON.stringify({
      authorizationEndedAtMs: 100,
      firstRejectingReadStartedAtMs: 2001,
      maximumDeliveredExpiryMs: 1000,
      token: "PRIVATE_TOKEN",
    }),
    method: "POST",
  });
  expect(response.status).toBe(400);
  expect(await response.text()).not.toContain("PRIVATE");
  expect(p.evidence()).toBeNull();
  await expect(p.drain()).rejects.toThrow("Shared-host observation failed");
});
