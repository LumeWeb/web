import type { Preview } from "@storybook/react";
// Import the base preview settings from the shared package
import { basePreview } from "portal-storybook-config/preview";

// Spread the base preview settings
const preview: Preview = { ...basePreview };
export default preview;
