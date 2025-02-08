import type { Config } from "tailwindcss";

import baseConfig from "@lumeweb/portal-framework-ui-core/tailwind.config";

const config = {
  ...baseConfig,
  corePlugins: {
    preflight: false,
  },
  layers: {
    base: false,
    components: false,
    utilities: false,
  },
} satisfies Config;

export default config;
