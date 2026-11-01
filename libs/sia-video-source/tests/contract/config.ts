/** Validates private, pre-provisioned inputs before a compatibility run can reach the network. */
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

export interface ContractConfig {
  readonly app: ContractFixture;
  readonly indexerUrl: string;
  /** SDK-reported decoded bytes, including rereads; encrypted host traffic can exceed this. */
  readonly maxTransferBytes: number;
  readonly shared: ContractFixture;
  readonly sharingKeyHex: string;
  readonly timeoutMs: number;
  readonly userKeyHex: string;
  readonly version: 1;
}

export interface ContractFixture {
  readonly objectId: string;
  readonly rangeBytes: readonly number[];
  readonly rangeOffset: number;
  readonly seekSeconds: number;
  readonly sizeBytes: number;
}

export function authorizeContractRun(
  config: ContractConfig,
  env: Readonly<Record<string, string | undefined>>,
): void {
  if (env.DEBUG || env.PWDEBUG)
    throw new Error(
      "Browser diagnostics must be disabled for private fixtures",
    );
  if (
    env.SIA_VIDEO_CONTRACT_RUN !== "1" ||
    env.SIA_VIDEO_CONTRACT_APPROVED_ORIGIN !== new URL(config.indexerUrl).origin
  )
    throw new Error(
      "Live execution needs explicit consent for the fixture origin",
    );
}

export function parseContractConfig(value: unknown): ContractConfig {
  const input = record(value, [
    "app",
    "indexerUrl",
    "maxTransferBytes",
    "shared",
    "sharingKeyHex",
    "timeoutMs",
    "userKeyHex",
    "version",
  ]);
  if (input.version !== 1) invalid("version");
  let endpoint: URL;
  try {
    if (typeof input.indexerUrl !== "string") invalid("indexerUrl");
    endpoint = new URL(input.indexerUrl);
  } catch {
    invalid("indexerUrl");
  }
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  )
    invalid("indexerUrl");
  const app = parseFixture(input.app);
  const shared = parseFixture(input.shared);
  if (app.objectId === shared.objectId) invalid("distinct object identities");
  return {
    app,
    indexerUrl: endpoint.href,
    maxTransferBytes: integer(
      input.maxTransferBytes,
      app.sizeBytes + shared.sizeBytes,
      33554432,
      "maxTransferBytes",
    ),
    shared,
    sharingKeyHex: key(input.sharingKeyHex, "sharingKeyHex"),
    timeoutMs: integer(input.timeoutMs, 1, 120000, "timeoutMs"),
    userKeyHex: key(input.userKeyHex, "userKeyHex"),
    version: 1,
  };
}

/** Read through one handle so a replacement path cannot bypass the permission check. */
export async function readContractFile(
  path: string,
  checkoutRoots: readonly string[],
): Promise<ContractConfig> {
  try {
    if (!(await lstat(path)).isFile()) throw new Error();
    const canonical = await realpath(path);
    for (const root of checkoutRoots) {
      const canonicalRoot = await realpath(root).catch(() => resolve(root));
      const child = relative(canonicalRoot, canonical);
      if (
        child === "" ||
        (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`))
      )
        throw new Error();
    }
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const info = await file.stat();
      if (
        !info.isFile() ||
        typeof process.getuid !== "function" ||
        info.uid !== process.getuid() ||
        (info.mode & 0o077) !== 0 ||
        (info.mode & 0o400) === 0 ||
        info.size > 16384
      )
        throw new Error();
      const buffer = Buffer.alloc(16385);
      let length = 0;
      while (length < buffer.length) {
        const { bytesRead } = await file.read(
          buffer,
          length,
          buffer.length - length,
          length,
        );
        if (bytesRead === 0) break;
        length += bytesRead;
      }
      if (length > 16384) throw new Error();
      return parseContractConfig(
        JSON.parse(buffer.toString("utf8", 0, length)),
      );
    } finally {
      await file.close();
    }
  } catch {
    // JSON syntax and filesystem errors can include the secret value or its path.
    throw new Error("Private fixture is unreadable, unsafe or invalid");
  }
}

function integer(
  value: unknown,
  min: number,
  max: number,
  field: string,
): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  )
    invalid(field);
  return value;
}

function invalid(field: string): never {
  throw new Error(`Invalid real-SDK fixture: ${field}`);
}

function key(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value))
    invalid(field);
  return value;
}

function parseFixture(value: unknown): ContractFixture {
  const input = record(value, [
    "objectId",
    "rangeBytes",
    "rangeOffset",
    "seekSeconds",
    "sizeBytes",
  ]);
  const objectId = key(input.objectId, "objectId");
  const sizeBytes = integer(input.sizeBytes, 1, 4194304, "sizeBytes");
  const rangeOffset = integer(
    input.rangeOffset,
    0,
    sizeBytes - 1,
    "rangeOffset",
  );
  const bytes = input.rangeBytes;
  if (!Array.isArray(bytes) || bytes.length === 0 || bytes.length > 4096)
    invalid("rangeBytes");
  const rangeBytes = bytes.map((byte: unknown) =>
    integer(byte, 0, 255, "rangeBytes"),
  );
  if (rangeOffset + rangeBytes.length > sizeBytes) invalid("rangeBytes");
  const seekSeconds = input.seekSeconds;
  if (
    typeof seekSeconds !== "number" ||
    !Number.isFinite(seekSeconds) ||
    seekSeconds <= 0
  )
    invalid("seekSeconds");
  return { objectId, rangeBytes, rangeOffset, seekSeconds, sizeBytes };
}

function record(
  value: unknown,
  fields: readonly string[],
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    invalid("shape");
  const result = value as Record<string, unknown>;
  if (Object.keys(result).some((key) => !fields.includes(key)))
    invalid("unknown field");
  return result;
}
