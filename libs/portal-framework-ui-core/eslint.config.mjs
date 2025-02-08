import parent from "../../eslint.config.mjs";

export default [
  ...parent,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react/prop-types": "off",
    },
  },
];
