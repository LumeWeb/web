import type { Config } from "tailwindcss";

import { tailwindSafelist, tailwindBlocklist } from "@lumeweb/portal-framework-ui-core/config/classlist";
import baseConfig from "@lumeweb/portal-framework-ui-core/tailwind.config";

const config = {
  ...baseConfig,
  safelist: tailwindSafelist,
  blocklist: tailwindBlocklist,
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
