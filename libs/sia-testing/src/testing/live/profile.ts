/** Private profiles are opened without following the final link and never serialize their credentials. */
import { constants } from "node:fs";
import { access, open, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import type { AppDefinition } from "../types.js";
import type {
  LiveAuthentication,
  LiveConsent,
  LiveLimits,
  LiveProfile,
  LiveProfileDocument,
  UploadEncoding,
} from "./types.js";
const profiles = new WeakMap<LiveProfile, LiveProfileDocument>();
const defaults: LiveLimits = {
  cleanupDeadlineMs: 30_000,
  deadlineMs: 120_000,
  maxDecodedDownloadBytes: 32 * 1024 * 1024,
  maxLogicalUploadBytes: 16 * 1024 * 1024,
  maxObjects: 8,
  maxObservedShardBytes: 64 * 1024 * 1024,
  maxShares: 8,
};
export async function loadLiveProfile(
  path: string,
  consent: LiveConsent,
  workspaceRoot?: string,
): Promise<LiveProfile> {
  if (consent?.transfers !== true || consent.mutations !== true)
    throw failure("consent-required");
  let approved: string;
  try {
    approved = endpoint(consent.apiBaseUrl);
  } catch {
    throw failure("consent-required");
  }
  if (!isAbsolute(path) || !process.getuid) throw failure("invalid-profile");
  let document: LiveProfileDocument;
  try {
    // O_NONBLOCK lets fstat reject a named pipe without waiting for its writer.
    const file = await open(
      path,
      constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
    );
    try {
      const stat = await file.stat();
      if (
        !stat.isFile() ||
        stat.uid !== process.getuid() ||
        stat.nlink !== 1 ||
        (stat.mode & 0o077) !== 0 ||
        stat.size > 16384
      )
        throw failure("invalid-profile");
      const actualPath = await realpath(path);
      if (await checkoutRoot(dirname(actualPath)))
        throw failure("invalid-profile");
      const checkout =
        workspaceRoot === undefined
          ? await checkoutRoot(process.cwd())
          : await realpath(workspaceRoot);
      if (checkout) {
        const child = relative(checkout, actualPath);
        if (
          child === "" ||
          (!isAbsolute(child) &&
            child !== ".." &&
            !child.startsWith(
              ".." + (process.platform === "win32" ? "\\" : "/"),
            ))
        )
          throw failure("invalid-profile");
      }
      const buffer = Buffer.alloc(16385);
      let length = 0;
      while (length < buffer.length) {
        const result = await file.read(
          buffer,
          length,
          buffer.length - length,
          null,
        );
        if (!result.bytesRead) break;
        length += result.bytesRead;
      }
      if (length > 16384) throw failure("invalid-profile");
      const bytes = buffer.subarray(0, length);
      document = parse(
        JSON.parse(
          new TextDecoder("utf-8", { fatal: true }).decode(bytes),
        ) as unknown,
      );
    } finally {
      await file.close();
    }
  } catch {
    throw failure("invalid-profile");
  }
  if (document.apiBaseUrl !== approved) throw failure("consent-required");
  const profile = Object.freeze(
    Object.defineProperties(Object.create(null), {
      [Symbol.for("nodejs.util.inspect.custom")]: {
        value: () => "[Sia live profile]",
      },
      toJSON: { value: () => "[Sia live profile]" },
    }),
  ) as LiveProfile;
  profiles.set(profile, document);
  return profile;
}
export function profileDocument(profile: LiveProfile): LiveProfileDocument {
  const document = profiles.get(profile);
  if (!document) throw failure("invalid-profile");
  return document;
}
async function checkoutRoot(directory: string): Promise<string | undefined> {
  let current = resolve(directory);
  for (;;) {
    try {
      await access(join(current, ".git"));
      return await realpath(current);
    } catch {
      /* A parent may contain the checkout marker. */
    }
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}
function endpoint(value: unknown): string {
  const url = new URL(text(value));
  if (
    url.username ||
    url.password ||
    url.hash ||
    url.search ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["127.0.0.1", "[::1]"].includes(url.hostname)
      ))
  )
    throw failure("invalid-profile");
  url.pathname = url.pathname.endsWith("/") ? url.pathname : url.pathname + "/";
  return url.href;
}
function failure(code: "consent-required" | "invalid-profile") {
  return Object.assign(
    new Error(
      code === "invalid-profile"
        ? "Invalid private Sia profile"
        : "Explicit Sia endpoint and transfer consent is required",
    ),
    { code, phase: "configuration" },
  );
}
function hex(value: unknown): string {
  if (typeof value !== "string" || !/^[a-fA-F0-9]{64}$/.test(value))
    throw failure("invalid-profile");
  return value.toLowerCase();
}
function integer(value: unknown, minimum: number, maximum: number): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum
  )
    throw failure("invalid-profile");
  return value;
}
function keys(value: Record<string, unknown>, allowed: readonly string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    throw failure("invalid-profile");
}
function parse(value: unknown): LiveProfileDocument {
  const input = record(value);
  keys(input, ["version", "apiBaseUrl", "app", "encoding", "limits", "auth"]);
  if (input.version !== 1) throw failure("invalid-profile");
  const app = record(input.app);
  keys(app, ["id", "name", "description", "serviceUrl"]);
  const definition: AppDefinition = Object.freeze({
    description: text(app.description),
    id: hex(app.id),
    name: text(app.name),
    serviceUrl: publicUrl(app.serviceUrl),
  });
  const encoding = record(input.encoding);
  keys(encoding, ["dataShards", "parityShards", "maxBufferedSlabs"]);
  const coding: UploadEncoding = Object.freeze({
    dataShards: integer(encoding.dataShards, 1, 255),
    maxBufferedSlabs: integer(encoding.maxBufferedSlabs, 1, 8),
    parityShards: integer(encoding.parityShards, 0, 254),
  });
  if (coding.dataShards + coding.parityShards > 255)
    throw failure("invalid-profile");
  const auth = record(input.auth);
  let authentication: LiveAuthentication;
  if (auth.kind === "app-key") {
    keys(auth, ["kind", "appKeyHex"]);
    authentication = { appKeyHex: hex(auth.appKeyHex), kind: "app-key" };
  } else if (auth.kind === "register") {
    keys(auth, ["kind", "phrase", "connectKey"]);
    authentication = {
      connectKey: text(auth.connectKey),
      kind: "register",
      phrase: text(auth.phrase),
    };
  } else if (auth.kind === "preauthorized") {
    keys(auth, ["kind", "phrase", "preauthorizedKeyHex"]);
    authentication = {
      kind: "preauthorized",
      phrase: text(auth.phrase),
      preauthorizedKeyHex: hex(auth.preauthorizedKeyHex),
    };
  } else throw failure("invalid-profile");
  const limits = input.limits === undefined ? {} : record(input.limits);
  keys(limits, Object.keys(defaults));
  const bounded: LiveLimits = Object.freeze({
    cleanupDeadlineMs: integer(
      limits.cleanupDeadlineMs ?? defaults.cleanupDeadlineMs,
      1,
      120_000,
    ),
    deadlineMs: integer(limits.deadlineMs ?? defaults.deadlineMs, 1, 120_000),
    maxDecodedDownloadBytes: integer(
      limits.maxDecodedDownloadBytes ?? defaults.maxDecodedDownloadBytes,
      0,
      64 * 1024 * 1024,
    ),
    maxLogicalUploadBytes: integer(
      limits.maxLogicalUploadBytes ?? defaults.maxLogicalUploadBytes,
      0,
      16 * 1024 * 1024,
    ),
    maxObjects: integer(limits.maxObjects ?? defaults.maxObjects, 0, 64),
    maxObservedShardBytes: integer(
      limits.maxObservedShardBytes ?? defaults.maxObservedShardBytes,
      0,
      256 * 1024 * 1024,
    ),
    maxShares: integer(limits.maxShares ?? defaults.maxShares, 0, 64),
  });
  return Object.freeze({
    apiBaseUrl: endpoint(input.apiBaseUrl),
    app: definition,
    auth: Object.freeze(authentication),
    encoding: coding,
    limits: bounded,
    version: 1,
  });
}
function publicUrl(value: unknown): string {
  const url = new URL(text(value));
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw failure("invalid-profile");
  return url.href;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw failure("invalid-profile");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 4096)
    throw failure("invalid-profile");
  return value;
}
