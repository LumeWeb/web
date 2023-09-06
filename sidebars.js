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
      label: "Extension",
      items: [
        "extension/start",
        "extension/account",
        "extension/bootup",
        "extension/sync",
        "extension/websites",
      ],
    },
  ],
};

module.exports = sidebars;
