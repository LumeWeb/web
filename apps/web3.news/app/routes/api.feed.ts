import { json, LoaderFunctionArgs } from "@remix-run/node";
import { fetchFeedData } from "@/lib/feed";

type Filter = "latest" | "day" | "week" | "month";

export async function loader({ request }: LoaderFunctionArgs) {
  const search = new URL(request.url).searchParams;
  let filter: Filter | null = null;
  let page = "0";
  const searchEntries = Array.from(search.entries());
  if (searchEntries.length) {
    const searchParams = Object.fromEntries(searchEntries);
    ({ filter, page = "0" } = searchParams as any as {
      filter: Filter;
      page: string;
    });
  }

  try {
    // Define the limit of articles per page
    const limit = 5;

    // Calculate the `current` and `next` values based on the `page` parameter
    const current = parseInt(page, 10) * limit;
    const next = limit;

    // Prepare the parameters for fetchFeedData
    const queryParams = {
      filter: filter ? { timerange: filter } : undefined,
      next,
      limit,
      current,
    };

    // Fetch data using the fetchFeedData function
    const dataResponse = await fetchFeedData(queryParams);

    return json(dataResponse);
  } catch (error) {
    throw new Response("Internal Server Error", {
      status: 500,
    });
  }
}
