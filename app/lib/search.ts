import { MeiliSearch } from "meilisearch";

const meili = new MeiliSearch({ host: "http://127.0.0.1:7700" });

export default meili;
