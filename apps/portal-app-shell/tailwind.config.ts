import baseConfig from "@lumeweb/portal-framework-ui-core/tailwind.config";
import { tailwindSafelist } from "@lumeweb/portal-framework-ui-core/config/classlist";

export default {
  ...baseConfig,
  content: ["./index.html"],
  safelist: tailwindSafelist,
};
