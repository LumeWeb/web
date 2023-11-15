/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  main: [
    "index",
    {
      type: "category",
      label: "Introduction",
      link: null,
      items: ["intro/about", "intro/components", "intro/history"],
    },
    {
      type: "category",
      label: "Problems We Are Solving",
      link: null,
      items: [
        "problems/better-web",
        "problems/web2-limits",
        "problems/web3-building-blocks",
      ],
    },
    {
      type: "category",
      label: "Apps",
      link: null,
      items: ["apps/browser-webapp"],
    },
    "roadmap",
  ],
};

module.exports = sidebars;
