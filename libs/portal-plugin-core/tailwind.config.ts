import type { Config } from "tailwindcss";

import baseConfig from "@lumeweb/portal-framework-ui-core/tailwind.config";

const config = {
  ...baseConfig,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  blocklist: ["flex-col", "hidden", "flex"],
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
