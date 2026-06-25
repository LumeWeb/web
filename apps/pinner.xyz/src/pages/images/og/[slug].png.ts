import type { APIRoute, GetStaticPaths } from "astro";
import { generateOGImage } from "@/lib/og-template";
import { OG_PAGES } from "@/lib/og-pages";

export const getStaticPaths: GetStaticPaths = async () => {
  return OG_PAGES.map((page) => ({
    params: { slug: page.slug },
  }));
};

export const GET: APIRoute = async ({ params }) => {
  const page = OG_PAGES.find((p) => p.slug === params.slug);
  if (!page) {
    return new Response("Not found", { status: 404 });
  }

  const png = await generateOGImage(page);

  return new Response(png, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
