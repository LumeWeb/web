import type { Config } from "tailwindcss";

// Assuming baseConfig might have its own theme/extend/colors structure
import baseConfig from "@lumeweb/portal-framework-ui-core/tailwind.config";

// Define your new colors separately for clarity
const newExtendedColors = {
  button: {
    DEFAULT: "hsl(var(--button))",
    hover: "hsl(var(--button-hover))",
  },
  modal: {
    background: "hsl(var(--modal-background))",
    border: "hsl(var(--modal-border))",
    input: "hsl(var(--modal-input))",
  },
  confirmation: {
    button: "hsl(var(--confirmation-button))",
    badge: "hsl(var(--confirmation-badge))",
    heading: "hsl(var(--confirmation-heading))",
  },
};

const config = {
  // 1. Start with the base configuration
  ...baseConfig,

  // 2. Override specific top-level properties as before
  corePlugins: {
    preflight: false,
  },
  layers: {
    base: false,
    components: false,
    utilities: false,
  },

  // 3. Carefully merge the theme object
  theme: {
    // 4. Spread the base theme first (if it exists) to keep base theme settings
    ...baseConfig.theme,

    // 5. Define or extend the 'extend' object
    extend: {
      // 6. Spread the base theme's extend section (if it exists)
      //    This keeps existing extensions like spacing, fontSize, etc.
      //    Use optional chaining `?.` in case `theme` or `extend` don't exist in baseConfig
      ...baseConfig.theme?.extend,

      // 7. Define or extend the 'colors' object within 'extend'
      colors: {
        // 8. Spread the base theme's *extended* colors (if they exist)
        //    This keeps colors previously defined in baseConfig.theme.extend.colors
        ...baseConfig.theme?.extend?.colors,

        // 9. Add your new extended colors
        ...newExtendedColors,
      },
      // You could add other extensions here as well, e.g.:
      // spacing: {
      //   ...baseConfig.theme?.extend?.spacing,
      //   '128': '32rem',
      // }
    },
  },
} satisfies Config; // Use `satisfies` for type checking without changing the JS output type

export default config;
