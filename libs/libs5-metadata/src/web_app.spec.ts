import * as fs from "fs";
import * as path from "path";
import { WebApp } from "./web_app";
import { equalBytes } from "@noble/curves/abstract/utils";

const FIXTURES_DIR = path.resolve(__dirname, "../test/fixtures");

describe("WebApp", () => {
  test("decode from msgpack", () => {
    const data = fs.readFileSync(
      path.join(FIXTURES_DIR, "web_app.msgpack.bin"),
    );
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "web_app.json")).toString(),
    );
    const webApp = WebApp.fromBuffer(data);
    const appJson = webApp.toJSON();

    expect(appJson).toEqual(jsonData);
  });

  test("encode to msgpack", () => {
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "web_app.json")).toString(),
    );

    const webApp = new WebApp();
    webApp.fromJSON(jsonData);

    const encoded = webApp.encode();

    expect(
      equalBytes(
        encoded,
        fs.readFileSync(path.join(FIXTURES_DIR, "web_app.msgpack.bin")),
      ),
    ).toBe(true);
  });
});
