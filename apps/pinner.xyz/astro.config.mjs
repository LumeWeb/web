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
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
        },
        {
          userAgent: "GPTBot",
          allow: "/",
        },
        {
          userAgent: "ChatGPT-User",
          allow: "/",
        },
        {
          userAgent: "Google-Extended",
          allow: "/",
        },
        {
          userAgent: "PerplexityBot",
          allow: "/",
        },
        {
          userAgent: "ClaudeBot",
          allow: "/",
        },
        {
          userAgent: "Bytespider",
          allow: "/",
        },
        {
          userAgent: "Applebot-Extended",
          allow: "/",
        },
      ],
      transform(content) {
        return `${content}\nContent-Signal: ai-train=yes, search=yes, ai-input=yes\n`;
      },
    }),
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
