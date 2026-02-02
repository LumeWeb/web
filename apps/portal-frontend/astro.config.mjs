// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  server: {
    allowedHosts: true,
  },
  vite: {
    optimizeDeps: {
      include: ["swiper"],
    },
    ssr: {
      noExternal: ["swiper"], // Add this line
    },
    plugins: [tailwindcss()],
  },
});
