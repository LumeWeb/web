import {
  json,
  LoaderFunction,
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/node";
import { S5Client } from "@lumeweb/s5-js";
import xml2js from "xml2js";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";
import slugify from "slugify";
import path from "path";

// Action function for POST requests
export async function action({ request }: ActionFunctionArgs) {
  const client = new S5Client("https://s5.web3portal.com");
  const data = await request.json();
  const meta = (await client.getMetadata(data.cid as string)) as any;
  const fileMeta = meta.metadata as any;
  const paths = fileMeta.paths as {
    [file: string]: {
      cid: string;
    };
  };

  if (!("sitemap.xml" in paths)) {
    throw new Response("Sitemap not found", { status: 404 });
  }

  const sitemapData = await client.downloadData(paths["sitemap.xml"].cid);
  const sitemap = await xml2js.parseStringPromise(sitemapData);

  const urls = sitemap.urlset.url.map((urlEntry: any) => {
    const url = urlEntry.loc[0];
    let pathname = new URL(url).pathname;

    // Normalize and remove leading and trailing slashes from the path
    pathname = path.normalize(pathname).replace(/^\/|\/$/g, "");

    // Function to determine if a URL path represents a directory
    const isDirectory = (pathname: string) => {
      // Check if the path directly maps to a file in the paths object
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

    // Fetch cid after confirming the final path
    const cid = paths[pathname]?.cid;

    return { url, cid, path: pathname }; // including cid in return object after final path is determined
  });

  for (const { url, cid } of urls) {
    if (cid) {
      const exists = await prisma.article.findUnique({
        where: { cid },
      });

      if (!exists) {
        // Fetch and parse the content using CID
        const contentData = Buffer.from(
          await client.downloadData(cid)
        ).toString();

        const $ = cheerio.load(contentData);
        const title = $("title").text(); // Extract the title from the content

        const record = {
          title,
          url,
          cid: cid,
          createdAt: new Date(),
          updatedAt: new Date(),
          slug: slugify(new URL(url).pathname),
          siteKey: slugify(data.site as string),
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
