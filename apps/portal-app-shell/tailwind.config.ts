import baseConfig from "@lumeweb/portal-framework-ui-core/tailwind.config";

export default {
  ...baseConfig,
  content: ["./index.html"],
  safelist: [
    {
      pattern: /flex-*/,
    },
    "hidden",
  ],
};
