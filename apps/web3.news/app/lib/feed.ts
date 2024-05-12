import prisma, { Article } from "@/lib/prisma";
export type ApiResponse<T = Record<string, any>> = {
  data: T[];
  current: number;
  next?: number | null;
  amount?: number;
};
export async function fetchFeedData({
  filter,
  limit = 5,
  next = 5,
  current = 0,
}: {
  filter?: { timerange?: "latest" | "day" | "week" | "month" };
  next?: number;
  limit?: number;
  current?: number;
}): Promise<ApiResponse<Article>> {
  let query = {};

  if (filter?.timerange && filter.timerange !== "latest") {
    const now = new Date();
    const timeRanges = {
      day: 1,
      week: 7,
      month: 30, // Approximation for a month, adjust as needed
    };

    const daysToSubtract = timeRanges[filter.timerange];
    if (daysToSubtract !== undefined) {
      const dateFrom = new Date(now.setDate(now.getDate() - daysToSubtract));
      query = {
        where: {
          createdAt: {
            gte: dateFrom,
          },
        },
      };
    }
  }

  const articles = await prisma.article.findMany({
    ...query,
    skip: current,
    take: next,
  });

  const nextPointer = articles.length >= limit ? next + limit : null;

  return {
    data: articles,
    current: next,
    next: nextPointer,
    amount: articles.length,
  };
}
