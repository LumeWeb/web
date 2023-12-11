import { fetchFeedData } from "@/lib/feed.ts";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { filter, page = "0" } = req.nextUrl.searchParams as any as {
    filter: "latest" | "day" | "week" | "month";
    page: string;
  };

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

    return NextResponse.json(dataResponse);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
