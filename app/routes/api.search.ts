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

  const site = searchParams.get("site");
  const time = searchParams.get("time");

  let filters = [];

  if (site) {
    filters.push(`siteKey = ${site}`);
  }
  if (time) {
    filters.push(`createdTimestamp >= ${parseInt(time).toString()}`);
  }

  const results = await search.index("articles").search(query, {
    filter: filters.length ? filters.join(" AND ") : undefined,
  });

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
