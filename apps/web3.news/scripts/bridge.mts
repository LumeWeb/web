import { S5Client } from "@lumeweb/s5-js";
import { CID } from "@lumeweb/libs5";
import axios from "axios";
import { getAvailableSites } from "../app/utils.js";

const sites = getAvailableSites();

const client = new S5Client("https://s5.web3portal.com");
const httpClient = axios.create({
  baseURL: "http://app:8080",
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
