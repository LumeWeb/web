import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({ config: { applyBaseStyles: false } }),
    react(),
    sitemap(),
  ],
  outDir: "../../dist/apps/lumeweb.com",
  site: "https://lumeweb.com",
});
