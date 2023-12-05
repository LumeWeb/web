import prisma, { Article } from "../lib/prisma.ts";
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

  // const articles: Article[] = [
  //   {
  //     id: 1,
  //     title: "Mock Article 1",
  //     slug: "This is a mock article.",
  //     siteKey: "asdas",
  //     url: "asdasd",
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  //   {
  //     id: 2,
  //     title: "Mock Article 2",
  //     slug: "This is a mock article.",
  //     siteKey: "asdas",
  //     url: "asdasd",
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  // ];

  const nextPointer = articles.length >= limit ? next + limit : null;

  return {
    data: articles,
    current: next,
    next: nextPointer,
    amount: articles.length,
  };
}
