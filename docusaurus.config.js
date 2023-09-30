// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Lume Web Docs",
  tagline: "Freedom. Privacy. Ownership",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.lumeweb.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://git.lumeweb.com/LumeWeb/docs.lumeweb.com/src/branch/master/",
        },
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      navbar: {
        title: "Lume Web",
        logo: {
          alt: "Lume Web",
          src: "img/logo.svg",
          srcDark: "img/logo_dark.svg",
        },
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Start",
                to: "/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Lume Web",
                href: "https://lumeweb.com",
              },
              {
                label: "Discord",
                href: "https://discord.gg/qpC8ADp3rS",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/lumeweb3",
              },
              {
                label: "GitHub",
                href: "https://github.com/lumeweb3",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Hammer Technologies LLC. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      matomo: {
        matomoUrl: "https://piwiki.lumeweb.com",
        siteId: "3",
        phpLoader: "matomo.php",
        jsLoader: "matomo.js",
      },
    }),
  plugins: ["docusaurus-plugin-matomo"],
};

module.exports = config;
