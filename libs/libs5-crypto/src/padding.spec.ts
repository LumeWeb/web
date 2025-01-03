import * as path from "path";
import * as fs from "fs";

interface testCase {
  initialSize: number;
  expectedPaddedSize: number;
}

const FIXTURES_DIR = path.resolve(__dirname, "../test/fixtures");
import { padFileSizeDefault, checkPaddedBlock } from "./padding";

const testCasesJson = fs.readFileSync(
  path.join(FIXTURES_DIR, "padding_sizes.json"),
  "utf-8",
);
const testCases = JSON.parse(testCasesJson) as testCase[];

describe("padFileSizeDefault", () => {
  test.each(testCases)(
    "should pad initial size $initialSize to $expectedPaddedSize",
    ({ initialSize, expectedPaddedSize }) => {
      expect(padFileSizeDefault(initialSize)).toBe(expectedPaddedSize);
    },
  );

  test("should throw an error for overflow", () => {
    expect(() => padFileSizeDefault(Number.MAX_SAFE_INTEGER)).toThrowError(
      "Could not pad file size, overflow detected.",
    );
  });
});

describe("checkPaddedBlock", () => {
  test.each(testCases)(
    "should return true for padded size $expectedPaddedSize",
    ({ expectedPaddedSize }) => {
      expect(checkPaddedBlock(expectedPaddedSize)).toBe(true);
    },
  );

  test("should return false for non-padded size", () => {
    expect(checkPaddedBlock(1234)).toBe(false);
  });

  test("should throw an error for overflow", () => {
    expect(() => checkPaddedBlock(Number.MAX_SAFE_INTEGER)).toThrowError(
      "Could not check padded file size, overflow detected.",
    );
  });
});
