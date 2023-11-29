import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const numberOfArticles = 100; // Specify the number of articles to generate
  const articles = [];

  for (let i = 0; i < numberOfArticles; i++) {
    const title = faker.lorem.sentence();
    const slug = faker.helpers.slugify(title).toLowerCase();
    const url = faker.internet.url();
    const siteKey = faker.string.alphanumeric(10);

    articles.push({ title, slug, url, siteKey });
  }

  for (const article of articles) {
    await prisma.article.create({
      data: article,
    });
  }

  console.log(`${articles.length} articles created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
