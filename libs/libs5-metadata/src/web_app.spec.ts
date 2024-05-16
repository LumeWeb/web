import * as fs from "fs";
import * as path from "path";
import { WebApp, WebAppFile } from "./web_app";
import { CID } from "@lumeweb/libs5-encoding";
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

    expect(webApp.name).toBe(jsonData.name);
    expect(webApp.tryFiles).toEqual(jsonData.tryFiles);

    for (const [key, value] of webApp.errorPages!.entries()) {
      const jsonValue = jsonData.errorPages[key];
      expect(jsonValue).toBe(value);
    }

    for (const [key, value] of webApp.paths!.entries()) {
      const jsonValue = jsonData.paths[key];
      expect(value.cid.toBase64Url()).toBe(jsonValue.cid);
      expect(value.contentType).toBe(jsonValue.contentType);
    }

    expect(webApp.extraMetadata?.data.size).toEqual(0);
  });

  test("encode to msgpack", () => {
    const jsonData = JSON.parse(
      fs.readFileSync(path.join(FIXTURES_DIR, "web_app.json")).toString(),
    );

    const webApp = new WebApp();
    webApp.name = jsonData.name;
    webApp.tryFiles = jsonData.tryFiles;
    webApp.errorPages = new Map<number, string>();
    for (const [key, value] of Object.entries<string>(jsonData.errorPages)) {
      webApp.errorPages.set(parseInt(key), value);
    }

    webApp.paths = new Map<string, WebAppFile>();
    for (const [key, value] of Object.entries<{
      cid: string;
      contentType: string;
    }>(jsonData.paths)) {
      webApp.paths.set(
        key,
        new WebAppFile({
          cid: CID.decode(value.cid),
          contentType: value.contentType,
        }),
      );
    }

    const encoded = webApp.encode();

    fs.writeFileSync(
      path.join(FIXTURES_DIR, "web_app.msgpack_test.bin"),
      encoded,
    );

    expect(
      equalBytes(
        encoded,
        fs.readFileSync(path.join(FIXTURES_DIR, "web_app.msgpack.bin")),
      ),
    ).toBe(true);
  });
});
