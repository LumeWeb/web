import type { Preview } from "@storybook/react";

import { withThemeByClassName } from "@storybook/addon-themes";

// Import shared styles using the new path alias
import "./tailwind.css";
// Import any shared decorators, like the withFramework example
import { withFramework } from "./decorators/withFramework";

// This file defines the *base* Storybook preview settings
export const basePreview: Preview = {
  decorators: [
    withFramework, // Example shared decorator
    withThemeByClassName({
      defaultTheme: "light",
      // Example shared theme decorator
      themes: { dark: "dark", light: "" },
    }),
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Add other shared parameters here (e.g., layout, backgrounds)
  },
  // Add tags if they are common to all stories (e.g., 'autodocs')
  tags: ["autodocs"],
};
