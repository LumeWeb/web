import type { StorybookConfig } from "@storybook/react-vite";

// This file defines the *base* Storybook configuration
// Settings here are shared across all Storybook instances in the monorepo.
const baseConfig: Partial<StorybookConfig> = {
  // Addons shared by all Storybook instances
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-themes", // For dark/light mode example
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default baseConfig;
