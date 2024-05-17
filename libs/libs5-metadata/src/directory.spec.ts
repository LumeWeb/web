import * as fs from "fs";
import * as path from "path";
import { Directory } from "./directory";
import { equalBytes } from "@noble/curves/abstract/utils";

const FIXTURES_DIR = path.resolve(__dirname, "../test/fixtures");

describe("Directory", () => {
  test("decode from msgpack", () => {
    const data = fs.readFileSync(
      path.join(FIXTURES_DIR, "directory.msgpack.bin"),
    );
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "directory.json")).toString(),
    );
    const directory = Directory.fromBuffer(data);

    const directoryJson = directory.toJSON();

    expect(directoryJson).toEqual(jsonData);
  });

  test("encode to msgpack", () => {
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "directory.json")).toString(),
    );
    const directory = new Directory();
    directory.fromJSON(jsonData);

    const encoded = directory.encode();

    fs.writeFileSync(
      path.join(FIXTURES_DIR, "directory.msgpack_generated.bin"),
      encoded,
    );

    expect(
      equalBytes(
        encoded,
        fs.readFileSync(path.join(FIXTURES_DIR, "directory.msgpack.bin")),
      ),
    ).toBe(true);
  });
});
