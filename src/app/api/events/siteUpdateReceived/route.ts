import { type NextRequest, NextResponse } from "next/server";
import { S5Client } from "@lumeweb/s5-js";
import xml2js from "xml2js";
import prisma from "../../../../lib/prisma.ts";
import * as cheerio from "cheerio";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  if (req.ip != "127.0.0.1") {
    return NextResponse.error();
  }

  const client = new S5Client("https://s5.web3portal.com");
  const meta = await client.getMetadata(
    req.nextUrl.searchParams.get("cid") as string,
  );

  const paths = (meta.metadata as any).paths as {
    [file: string]: {
      cid: string;
    };
  };
  if (!("sitemap.xml" in paths)) {
    return NextResponse.error();
  }

  const sitemapData = await client.downloadData(paths["sitemap.xml"].cid);
  const sitemap = await xml2js.parseStringPromise(sitemapData);

  const urls = sitemap.urlset.url.map((urlEntry: any) => {
    const url = urlEntry.loc[0];
    const cid = paths[url]?.cid;
    return { url, cid };
  });

  for (const { url, cid } of urls) {
    if (cid) {
      const exists = await prisma.article.findUnique({
        where: { cid },
      });

      if (!exists) {
        // Fetch and parse the content using CID
        const contentData = Buffer.from(
          await client.downloadData(cid),
        ).toString();

        const $ = cheerio.load(contentData);
        const title = $("title").text(); // Extract the title from the content

        // Insert a new record into the database
        await prisma.article.create({
          data: {
            title,
            url,
            cid: cid,
            createdAt: new Date(),
            updatedAt: new Date(),
            slug: slugify(new URL(url).pathname),
            siteKey: slugify(req.nextUrl.searchParams.get("site") as string),
          },
        });
      }
    }
  }
}
