import type { StorybookConfig } from "@storybook/react-vite";
// Import the base configuration from the shared package
import baseConfig from "portal-storybook-config/main";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "node:path";

const config: Partial<StorybookConfig> = {
  ...baseConfig, // Inherit shared addons, framework settings, etc.
  stories: [
    "../../../libs/portal-framework-core/src/**/*.stories.@(ts|tsx)",
    //    "../../../libs/portal-framework-ui-core/src/**/*.stories.@(ts|tsx)",
  ],
};

export default config;
