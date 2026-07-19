import { defineConfig, McpSource } from "vocs/config";

export default defineConfig({
  title: "Pinner.xyz",
  description: "Privacy-focused storage without the infrastructure.",
  renderStrategy:
    process.env.VOCS_RENDER_STRATEGY === "dynamic" ? "dynamic" : "full-static",
  backendUrl:
    process.env.VOCS_RENDER_STRATEGY === "dynamic"
      ? undefined
      : "https://backend.docs.pinner.xyz",
  srcDir: "docs",

  logoUrl: {
    light: "/logo-light.svg",
    dark: "/logo-dark.svg",
  },
  iconUrl: "/icon.svg",

  mcp: {
    enabled: true,
    sources: [
      McpSource.github({
        name: "pinner-sdk",
        repo: "LumeWeb/web",
        branch: "develop",
        paths: ["libs/pinner/src"],
      }),
      McpSource.github({
        name: "pinner-cli",
        repo: "LumeWeb/pinner-cli",
        branch: "develop",
      }),
      McpSource.github({
        name: "ipfs-sdk",
        repo: "LumeWeb/ipfs-sdk",
        branch: "develop",
      }),
    ],
  },

  accentColor: "light-dark(#D97706, #ADF0DD)",
  sidebar: [
    // ── Landing ──
    { text: "Welcome", link: "/" },

    // ── Account & Cross-cutting ──
    {
      text: "Account",
      collapsed: true,
      items: [
        { text: "Sign Up & Get Started", link: "/account/signup" },
        { text: "API Keys", link: "/account/api-tokens" },
        { text: "Billing & Plans", link: "/account/billing" },
        { text: "Quotas & Limits", link: "/account/quotas" },
        { text: "Account Operations", link: "/account/operations" },
      ],
    },
    {
      text: "DNS",
      collapsed: true,
      items: [
        { text: "Manage DNS Zones", link: "/dns/how-to/manage-zones" },
        { text: "Manage DNS Records", link: "/dns/how-to/manage-records" },
      ],
    },
    {
      text: "Migration",
      collapsed: true,
      items: [
        {
          text: "From Fleek",
          collapsed: true,
          items: [
            { text: "Migration Guide", link: "/migration/fleek" },
            { text: "DNS Migration", link: "/migration/fleek/dns-migration" },
          ],
        },
        {
          text: "From Pinata",
          collapsed: true,
          items: [
            { text: "Migration Guide", link: "/migration/pinata" },
            { text: "Adapter Reference", link: "/migration/pinata/adapter-reference" },
            { text: "Code Examples", link: "/migration/pinata/examples" },
          ],
        },
      ],
    },

    // ── Product 1: IPFS Pinning ──
    {
      text: "IPFS Pinning",
      collapsed: false,
      items: [
        { text: "Quickstart", link: "/ipfs/quickstart" },
        {
          text: "How-to Guides",
          collapsed: true,
          items: [
            { text: "Upload a Single File", link: "/ipfs/how-to/upload-file" },
            { text: "Upload a Directory", link: "/ipfs/how-to/upload-directory" },
            { text: "Upload a CAR File", link: "/ipfs/how-to/upload-car" },
            { text: "List & Search Pins", link: "/ipfs/how-to/list-pins" },
            { text: "Check Pin Status", link: "/ipfs/how-to/check-pin-status" },
            { text: "Delete / Unpin Content", link: "/ipfs/how-to/delete-pins" },
            { text: "Pin Multiple Files at Once", link: "/ipfs/how-to/batch-pin" },
            { text: "Add and Update Metadata", link: "/ipfs/how-to/manage-metadata" },
            { text: "Automate Pinning in CI/CD", link: "/ipfs/how-to/automate-pinning" },
            { text: "Access Your Pinned Content", link: "/ipfs/how-to/access-pinned-content" },
            { text: "Integrate with an MCP Client", link: "/ipfs/how-to/integrate-mcp-client" },
            { text: "Troubleshoot Upload Failures", link: "/ipfs/how-to/troubleshoot-uploads" },
          ],
        },
        {
          text: "Concepts",
          collapsed: true,
          items: [
            { text: "Content Identifiers (CIDs)", link: "/ipfs/concepts/cids" },
            { text: "Pin Lifecycle", link: "/ipfs/concepts/pin-lifecycle" },
            { text: "CAR Files", link: "/ipfs/concepts/car-files" },
            { text: "Why No Gateway?", link: "/ipfs/concepts/why-no-gateway" },
            { text: "How the SDK Is Organized", link: "/ipfs/concepts/sdk-architecture" },
            { text: "MCP Server", link: "/ipfs/concepts/mcp-server" },
          ],
        },
        {
          text: "SDK Guide",
          collapsed: true,
          items: [
            { text: "Getting Started", link: "/ipfs/sdk/getting-started" },
            { text: "Configuration", link: "/ipfs/sdk/configuration" },
            { text: "Error Handling", link: "/ipfs/sdk/errors" },
            { text: "Upload Progress & Events", link: "/ipfs/sdk/progress" },
          ],
        },
        {
          text: "CLI Guide",
          collapsed: true,
          items: [
            { text: "Getting Started", link: "/ipfs/cli/getting-started" },
            { text: "Authentication", link: "/ipfs/cli/auth" },
            { text: "Configuration", link: "/ipfs/cli/config" },
            { text: "Setup Wizard", link: "/ipfs/cli/setup" },
            { text: "Diagnostics", link: "/ipfs/cli/doctor" },
          ],
        },
        {
          text: "Reference",
          collapsed: true,
          items: [
            { text: "Error Reference", link: "/ipfs/reference/errors" },
          ],
        },
      ],
    },

    // ── Product 2: Websites & Domains ──
    {
      text: "Websites & Domains",
      collapsed: false,
      items: [
        { text: "Quickstart", link: "/web/quickstart" },
        {
          text: "Onchain Names",
          collapsed: true,
          items: [
            { text: "Quickstart", link: "/onchain/quickstart" },
            {
              text: "How-to Guides",
              collapsed: true,
              items: [
                { text: "Point & Unpoint", link: "/onchain/how-to/point-unpoint" },
              ],
            },
            {
              text: "Concepts",
              collapsed: true,
              items: [
                { text: "How Onchain Names Work", link: "/onchain/concepts/how-onchain-names-work" },
              ],
            },
          ],
        },
        {
          text: "Website Hosting",
          collapsed: true,
          items: [
            { text: "Quickstart", link: "/hosting/quickstart" },
            {
              text: "Tutorials",
              collapsed: true,
              items: [
                { text: "Deploy a Static Site", link: "/hosting/tutorials/deploy-static-site" },
              ],
            },
            {
              text: "How-to Guides",
              collapsed: true,
              items: [
                { text: "Deploy from GitHub Actions", link: "/hosting/how-to/deploy-github-actions" },
                { text: "Manage Websites", link: "/hosting/how-to/manage-websites" },
                { text: "Publish with IPNS", link: "/hosting/how-to/publish-ipns" },
                { text: "Custom Domains", link: "/hosting/how-to/custom-domains" },
                { text: "Check SSL Status", link: "/hosting/how-to/check-ssl" },
              ],
            },
            {
              text: "Concepts",
              collapsed: true,
              items: [
                { text: "How Website Hosting Works", link: "/hosting/concepts/how-hosting-works" },
                { text: "IPNS and Mutable Addresses", link: "/hosting/concepts/ipns" },
                { text: "SSL", link: "/hosting/concepts/ssl" },
                { text: "DNS and Domains", link: "/hosting/concepts/dns-and-domains" },
              ],
            },
          ],
        },
      ],
    },

    // ── Generated Reference ──
    {
      text: "Reference",
      collapsed: true,
      items: [
        {
          text: "CLI",
          collapsed: true,
          items: [
            { text: "Overview", link: "/reference/cli" },
            { text: "Setup", link: "/reference/cli/setup" },
            { text: "Content", link: "/reference/cli/content" },
            { text: "Pinning", link: "/reference/cli/pinning" },
            { text: "Websites & Domains", link: "/reference/cli/websites" },
            { text: "Admin", link: "/reference/cli/admin" },
            { text: "System", link: "/reference/cli/system" },
          ],
        },
        {
          text: "SDK",
          collapsed: true,
          items: [
            { text: "Overview", link: "/reference/sdk" },
            { text: "Pinner", link: "/reference/sdk/pinner" },
            { text: "UploadManager", link: "/reference/sdk/upload-manager" },
            { text: "IpnsClient", link: "/reference/sdk/ipns-client" },
            { text: "WebsitesClient", link: "/reference/sdk/websites-client" },
            { text: "Errors", link: "/reference/sdk/errors" },
            { text: "Types", link: "/reference/sdk/types" },
          ],
        },
        { text: "API Reference", link: "/reference/api" },
      ],
    },
  ],
});
