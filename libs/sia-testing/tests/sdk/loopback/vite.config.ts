import { defineConfig } from "vite";
import { siaStorage } from "@siafoundation/sia-storage/vite";

export default defineConfig({ optimizeDeps: { exclude: ["@siafoundation/sia-storage"] }, plugins: [siaStorage()], root: "tests/sdk/loopback", server: { fs: { strict: false }, port: 4181, strictPort: true } });
