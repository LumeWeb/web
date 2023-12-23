import { type LoaderFunctionArgs } from "@remix-run/node";
import search from "@/lib/search.js";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;

  const query = searchParams.get("q");

  if (!query || !query.length) {
    throw new Response("Invalid query", {
      status: 400,
    });
  }

  const results = await search.index("articles").search(query);

  return results.hits.map((item) => {
    return {
      id: item.id,
      timestamp: item.createdAt,
      title: item.title,
      description: "",
      slug: item.slug,
    };
  });
}
