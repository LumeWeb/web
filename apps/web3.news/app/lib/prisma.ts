import { PrismaClient, Article } from "@prisma/client";
import search from "./search.js";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = (globalForPrisma.prisma || new PrismaClient()).$extends({
  query: {
    article: {
      async create({ args, query }) {
        // Perform the create operation using Prisma
        const createdRecord = await query(args);

        // Index the created record in MeiliSearch
        const index = search.index("articles");
        const timestampInMilliseconds = Date.parse(
          createdRecord.createdAt as any
        ); // Date.parse returns the timestamp in milliseconds
        const timestamp = timestampInMilliseconds / 1000;
        await index.addDocuments([
          {
            ...createdRecord,

            createdTimestamp: timestamp,
          },
        ]);

        return createdRecord;
      },
    },
  },
});

export default prisma;
export type { Article };
