import { defineConfig } from "vocs/config";

export default defineConfig({
  title: "Lume Web",
  description: "Freedom. Privacy. Ownership.",
  baseUrl: "https://docs.lumeweb.com",
  renderStrategy: "full-static",
  srcDir: "docs",
  pagesDir: "pages",

  accentColor: "#7afcbb",
  colorScheme: "dark",

  // Navigation
  topNav: [
    { text: "Website", link: "https://lumeweb.com" },
    { text: "GitHub", link: "https://github.com/lumeweb" },
  ],

  sidebar: [
    {
      text: "Introduction",
      items: [
        { text: "Getting Started", link: "/intro/getting-started" },
        { text: "What is Lume?", link: "/intro/about" },
        { text: "History", link: "/intro/history" },
      ],
    },
    {
      text: "Portal",
      items: [
        { text: "Overview", link: "/portal/overview" },
        { text: "Features", link: "/portal/features" },
        { text: "Storing Files", link: "/portal/storing-files" },
      ],
    },
    {
      text: "Operators",
      items: [
        { text: "Overview", link: "/operators/overview" },
        { text: "Setup Guide", link: "/operators/setup" },
      ],
    },
    {
      text: "Roadmap",
      link: "/roadmap",
    },
  ],

  // Edit links
  editLink: {
    pattern:
      "https://github.com/lumeweb/docs/edit/main/apps/docs.lumeweb.com/docs/pages/:path",
    text: "Edit this page",
  },

  // Social links
  socials: [
    {
      icon: "github",
      link: "https://github.com/lumeweb",
    },
    {
      icon: "discord",
      link: "https://discord.gg/qpC8ADp3rS",
    },
    {
      icon: "x",
      link: "https://twitter.com/lumeweb3",
    },
  ],

  // Search configuration
  search: {
    // Boost important pages in search results
    boostDocument(documentId) {
      if (["/intro/getting-started", "/portal/overview"].includes(documentId)) {
        return 2;
      }
      return 1;
    },
  },
});
