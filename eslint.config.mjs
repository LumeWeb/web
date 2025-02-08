// eslint.config.js
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

const gitignorePath = path.resolve(__dirname, ".gitignore");

/** @type {import("eslint").Linter.FlatConfig[]} */
export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react": pluginReact,
      "react-hooks": reactHooks,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react/no-unknown-property": [
        "error",
        {
          ignore: ["cmdk-input-wrapper"],
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  perfectionist.configs["recommended-natural"],

  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        // Use `true` for automatic discovery (requires TS 5.2+ and ESLint 8.47+)
        // project: true,
        // OR specify paths explicitly (adjust glob patterns for your monorepo)
        project: [
          "./tsconfig.json",
          "./apps/*/tsconfig.json",
          "./libs/*/tsconfig.json",
        ],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",
    },
  },

  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".nx/",
      "coverage/",
      // Add other ignored paths...
    ],
  },
  // Uncomment if needed for complex .gitignore patterns
  // includeIgnoreFile(gitignorePath),
);
