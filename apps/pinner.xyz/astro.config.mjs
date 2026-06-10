// @ts-check
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import robotsTxt from "astro-robots-txt";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdAlternate from "astro-md-alternate";
import llms from "astro-llms-md";

// https://astro.build/config
export default defineConfig({
  site: "https://pinner.xyz",
  trailingSlash: "always",
  integrations: [
    react(),
    sitemap(),
    mdx(),
    robotsTxt(),
    mdAlternate({
      collections: [],
    }),
    llms({
      generateLlmsTxt: true,
      generateLlmsFullTxt: true,
      generateIndividualMd: true,
    }),
  ],
  server: {
    allowedHosts: true,
  },
  vite: {
    resolve: {
      tsconfigPaths: true,
    },
    optimizeDeps: {
      include: ["swiper"],
    },
    ssr: {
      noExternal: ["swiper"],
    },
    plugins: [tailwindcss()],
  },
});
