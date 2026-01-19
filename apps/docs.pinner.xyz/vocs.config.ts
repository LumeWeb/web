import { defineConfig } from "vocs";
import path from "path";

export default defineConfig({
  title: "Pinner.xyz",
  description: "Privacy-focused storage without the infrastructure.",

  // Font Configuration
  font: {
    default: { google: "Inter" },
    mono: { google: "JetBrains Mono" },
  },

  // Theme Configuration
  theme: {
    accentColor: {
      light: "#D97706",
      dark: "#ADF0DD",
    },
  },

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname),
      },
    },
  },
  sidebar: [
    {
      text: "About",
      collapsed: true,
      items: [
        { text: "What is Pinner?", link: "/about" },
        { text: "FAQ", link: "/about/faq" },
      ],
    },
    { text: "Quickstart", link: "/quickstart" },
    {
      text: "Guides",
      collapsed: true,
      items: [
        { text: "Upload your first file", link: "/guide/first-upload" },
        { text: "Migrate from Pinata", link: "/guide/pinata-migration" },
      ],
    },
    { text: "Installation", link: "/installation" },
    {
      text: "API Reference",
      collapsed: true,
      items: [
        { text: "API Documentation", link: "/api/swagger" },
        { text: "Authentication", link: "/api/authentication" },
        { text: "Small File Uploads", link: "/api/small-uploads" },
        { text: "Large File Uploads", link: "/api/large-uploads" },
        { text: "Archive Uploads", link: "/api/archives" },
        { text: "Upload Limits", link: "/api/limits" },
      ],
    },
    {
      text: "SDK Reference",
      collapsed: true,
      items: [
        { text: "Getting Started", link: "/sdk/getting-started" },
        { text: "Configuration", link: "/sdk/configuration" },
        { text: "Upload Files", link: "/sdk/upload" },
        { text: "Pin Management", link: "/sdk/pins" },
        { text: "Progress Tracking", link: "/sdk/progress" },
        { text: "Utilities", link: "/sdk/utilities" },
        { text: "Adapters", link: "/sdk/adapters" },
        { text: "Error Handling", link: "/sdk/errors" },
      ],
    },
    {
      text: "CLI Reference",
      collapsed: true,
      items: [
        { text: "Getting Started", link: "/cli/getting-started" },
        { text: "Authentication", link: "/cli/auth" },
        { text: "Upload", link: "/cli/upload" },
        { text: "Pin & Unpin", link: "/cli/pin" },
        { text: "List & Status", link: "/cli/list" },
        { text: "Metadata", link: "/cli/metadata" },
        { text: "Config & Setup", link: "/cli/config" },
        { text: "Doctor", link: "/cli/doctor" },
        { text: "Global Flags", link: "/cli/flags" },
        { text: "Shell Completions", link: "/cli/completion" },
        { text: "Troubleshooting", link: "/cli/troubleshooting" },
      ],
    },
    {
      text: "Concepts",
      collapsed: true,
      items: [
        { text: "CIDs", link: "/concepts/cids" },
        { text: "CAR Files", link: "/concepts/car-files" },
        { text: "Pin Lifecycle", link: "/concepts/pin-lifecycle" },
      ],
    },
    {
      text: "Account",
      collapsed: true,
      items: [
        { text: "Quotas & Limits", link: "/concepts/quotas" },
      ],
    },
    {
      text: "Migration",
      collapsed: true,
      items: [
        { text: "From Pinata SDK", link: "/migration/pinata" },
        { text: "Code Examples", link: "/migration/examples" },
      ],
    },
  ],
});
