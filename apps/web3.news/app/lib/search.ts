import { MeiliSearch } from "meilisearch";

const meili = new MeiliSearch({ host: "http://melli:7700" });

export default meili;
