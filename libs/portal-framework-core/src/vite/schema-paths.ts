import { resolve } from "node:path";

const __dirname = resolve(new URL(".", import.meta.url).pathname);

export const PLUGIN_REGISTRY_SCHEMA_PATH = resolve(__dirname, "schemas/plugin-registry.v1.json");
export const PORTAL_META_SCHEMA_PATH = resolve(__dirname, "schemas/portal-meta.v1.json");
