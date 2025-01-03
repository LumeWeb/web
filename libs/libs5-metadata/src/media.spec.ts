import * as fs from "fs";
import * as path from "path";
import { Media } from "./media";
import { expect } from "vitest";
import { equalBytes } from "@noble/curves/abstract/utils";

const FIXTURES_DIR = path.resolve(__dirname, "../test/fixtures");

describe("Media", () => {
  test("decode from msgpack", () => {
    const data = fs.readFileSync(path.join(FIXTURES_DIR, "media.msgpack.bin"));
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "media.json")).toString(),
    );
    const media = Media.fromBuffer(data);

    const mediaJson = media.toJSON();

    expect(mediaJson).toEqual(jsonData);
  });

  test("encode to msgpack", () => {
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "media.json")).toString(),
    );

    const media = new Media();
    media.fromJSON(jsonData);

    const encoded = media.encode();

    fs.writeFileSync(
      path.join(FIXTURES_DIR, "media.msgpack_generated.bin"),
      encoded,
    );

    expect(
      equalBytes(
        encoded,
        fs.readFileSync(path.join(FIXTURES_DIR, "media.msgpack.bin")),
      ),
    ).toBe(true);
  });
});
