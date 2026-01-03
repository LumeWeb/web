import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";

export interface TestData {
  cid: CID;
  block: Uint8Array;
}

export async function createTestCID(data: Uint8Array): Promise<CID> {
  const hash = await sha256.digest(data);
  return CID.create(1, 0x55, hash);
}

export async function createTestData(
  content: string | number[],
): Promise<TestData> {
  const block =
    typeof content === "string"
      ? new TextEncoder().encode(content)
      : new Uint8Array(content);

  const cid = await createTestCID(block);

  return { cid, block };
}

export async function createMultipleTestData(
  contents: Array<string | number[]>,
): Promise<TestData[]> {
  return Promise.all(contents.map(createTestData));
}

export const TEST_DATA = {
  simple: "Hello, World!",
  binary: [1, 2, 3, 4, 5, 6, 7, 8],
  json: JSON.stringify({ foo: "bar", num: 42 }),
  empty: "",
  large: "x".repeat(1024),
};

export const KNOWN_CID = CID.parse(
  "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
);
