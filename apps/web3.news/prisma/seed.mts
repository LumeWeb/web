import {PrismaClient} from "@prisma/client";
import {faker} from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
    const numberOfArticles = 100; // Specify the number of articles to generate
    const articles = [];

    for (let i = 0; i < numberOfArticles; i++) {
        const title = faker.lorem.sentence();
        const cid = faker.string.alphanumeric(10);;
        const url = faker.internet.url();
        const site = faker.string.alphanumeric(10);

        articles.push({title, cid, url, site});
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
