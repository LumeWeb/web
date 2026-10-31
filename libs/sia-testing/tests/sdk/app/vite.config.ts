import { defineConfig } from "vite";
import { siaStorage } from "@siafoundation/sia-storage/vite";

export default defineConfig({ plugins: [siaStorage()], root: "tests/sdk/app", server: { fs: { strict: false }, port: 4179, strictPort: true } });
