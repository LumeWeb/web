import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import astroLlmsTxt from "@4hse/astro-llms-txt";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    sitemap(),
    astroLlmsTxt({
      title: 'Lume Web',
      description: 'A platform, network and experience that allows you to control and own your online web.',
      details: 'Lume Web is building infrastructure for the open, user-owned web. We provide tools and services that respect privacy, resist censorship, and put users in control of their digital lives.',
      notes: '- This content is auto-generated from the official source.',
      docSet: [
        {
          title: 'Complete site',
          description: 'The full Lume Web documentation',
          url: '/llms-full.txt',
          include: ['**'],
          promote: ['index.astro'],
        },
        {
          title: 'Small site',
          description: 'Index of key pages',
          url: '/llms-small.txt',
          include: ['**'],
          onlyStructure: true,
          promote: ['index.astro'],
        },
      ],
      pageSeparator: '\n\n---\n\n',
    }),
  ],
  server: {
    allowedHosts: true,
  },
  outDir: "./dist",
  site: "https://lumeweb.com",

  vite: {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [tailwindcss()],
  },
});
