import * as fs from "fs";
import { S5Client } from "@lumeweb/s5-js";
import { CID } from "@lumeweb/libs5";
import axios from "axios";

type SiteList = {
  [domain: string]: {
    pubkey: string;
  };
};

const sites = JSON.parse(
  fs.readFileSync("sites.json", { encoding: "utf8" }),
) as SiteList;

const client = new S5Client("https://s5.web3portal.com");
const httpClient = axios.create({
  baseURL: "http://localhost",
});

for (const siteName in sites) {
  const site = sites[siteName];

  const sub = await client.subscribeToEntry(Buffer.from(site.pubkey, "hex"));
  sub.listen((entry) => {
    const cid = CID.fromRegistry(entry.data);

    try {
      httpClient.post("/api/events/siteUpdateReceived", {
        cid: cid.toString(),
        site: siteName,
      });
    } catch {}
  });
}
