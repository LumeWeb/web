import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOGImage } from "@/lib/og-template";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  return posts.map((post) => ({
    params: { slug: post.id },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection("blog", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const post = posts.find((p) => p.id === params.slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const description = post.data.description;

  // Use the description as subtitle if it's not too long (satori wrapping handles it,
  // but keep it readable). Cap at ~160 chars for the OG card.
  const subtitle =
    description.length <= 160 ? description : undefined;

  const png = await generateOGImage({
    headline: post.data.title,
    subtitle,
    subtitleSize: subtitle ? 24 : undefined,
    footer: "The Pinner Blog",
  });

  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
