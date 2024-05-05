import search from "../app/lib/search";

await search.createIndex("articles", { primaryKey: "id" });

const index = search.index("articles");

await index.updateFilterableAttributes(["site", "createdTimestamp"]);
