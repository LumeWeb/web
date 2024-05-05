import { ActionFunctionArgs } from "@remix-run/node";
import { S5Client } from "@lumeweb/s5-js";
import xml2js from "xml2js";
import { prisma } from "@/lib/prisma";
import path from "path";
import { getAvailableSites } from "@/utils.js";
import { CID } from "@lumeweb/libs5";

// Action function for POST requests
export async function action({ request }: ActionFunctionArgs) {
  const client = new S5Client("https://s5.web3portal.com");
  const data = await request.json();

  const site = data.site;
  const sites = getAvailableSites();

  if (!(site in sites)) {
    throw new Response("Site does not exist", { status: 404 });
  }

  const siteInfo = sites[site];

  const meta = (await client.getMetadata(data.cid as string)) as any;
  const fileMeta = meta.metadata as any;
  const paths = fileMeta.paths as {
    [file: string]: {
      cid: string;
    };
  };

  // Check if the RSS feed path exists in the paths
  if (!(siteInfo.rss in paths)) {
    throw new Response("RSS feed not found", { status: 404 });
  }

  // Download and parse the RSS feed
  const rssData = await client.downloadData(paths[siteInfo.rss].cid);
  const rss = await xml2js.parseStringPromise(rssData);

  // Process each item in the RSS feed
  for (const item of rss.rss.channel[0].item) {
    const url = item.link[0];
    const title = item.title[0]; // Title is directly available from the feed

    let pathname = new URL(url).pathname;

    // Normalize and remove leading and trailing slashes from the path
    pathname = path.normalize(pathname).replace(/^\/|\/$/g, "");

    // Function to determine if a URL path represents a directory
    const isDirectory = (pathname: string) => {
      return !paths.hasOwnProperty(pathname);
    };

    // Check if the path is a directory and look for a directory index
    if (isDirectory(pathname)) {
      for (const file of fileMeta.tryFiles) {
        const indexPath = path.join(pathname, file);
        if (paths.hasOwnProperty(indexPath)) {
          pathname = indexPath;
          break;
        }
      }
    }

    const cid = paths[pathname]?.cid;

    if (cid) {
      const exists = await prisma.article.findUnique({
        where: { cid },
      });

      if (!exists) {
        const record = {
          title,
          url,
          cid: CID.decode(cid).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          site: data.site,
        };

        // Insert a new record into the database
        await prisma.article.create({
          data: record,
        });
      }
    }
  }

  return new Response("", { status: 200 });
}
