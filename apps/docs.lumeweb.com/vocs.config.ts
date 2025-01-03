import { defineConfig } from "vocs";

export default defineConfig({
  title: "Lume Web",
  description: "Freedom. Privacy. Ownership.",
  baseUrl: "https://docs.lumeweb.com",

  // Theme customization matching Lume Web colors
  theme: {
    accentColor: "#7afcbb", // $color-aquamarine
    colorScheme: "dark", // Default to dark mode since main site is dark
    variables: {
      color: {
        // Main colors
        background: "#031418", // $color-blue-charcoal-2
        background2: "#020e10", // $color-blue-charcoal
        text: "#ffffff",
        text2: "#c7c7c7", // $color-cloud
        text3: "#a0aec0",
        heading: "#ffffff",

        // Accent colors
        backgroundAccent: "#7afcbb",
        backgroundAccentHover: "#1F4A3D",
        textAccent: "#7afcbb",

        // Border colors
        border: "#0B3F48",
        border2: "#1a2e34",

        // Code colors
        codeBlockBackground: "#020e10",
        codeInlineBackground: "#031418",
        codeInlineText: "#7afcbb",
      },

      // Typography
      fontFamily: {
        default: "'IBM Plex Sans Devanagari', system-ui, sans-serif",
        mono: "'JetBrains Mono', monospace",
      },
      fontSize: {
        root: "16px",
        code: "14px",
        h1: "2.5rem",
        h2: "2rem",
        h3: "1.75rem",
        h4: "1.5rem",
        h5: "1.25rem",
        h6: "1rem",
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
      },
    },
  },

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
