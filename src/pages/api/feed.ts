import type { NextApiRequest, NextApiResponse } from "next";
import { fetchFeedData } from "@/lib/feed.ts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { filter, page = "0" } = req.query as any as {
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

    // Send the response back
    res.status(200).json(dataResponse);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: "Internal Server Error" });
  }
}
