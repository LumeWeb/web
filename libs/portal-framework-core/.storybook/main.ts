import type { StorybookConfig } from "@storybook/react-vite";
import baseConfig from "portal-storybook-config/main"; // Import base config

const config: StorybookConfig = {
  ...baseConfig, // Spread the base configuration first
  // This package's stories are now included via the root Storybook config glob
  // Override or add package-specific settings here if needed
  // For example, if this package needs a unique addon
  // addons: [...(baseConfig.addons || []), "addon-specific-to-this-package"],
};

export default config;
