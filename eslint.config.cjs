// @ts-check

const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: typescriptParser,
      globals: {
        React: "readonly",
      },
    },
    plugins: {
      react,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      ...prettierConfig.rules,

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },

  prettierConfig,

  {
    ignores: ["node_modules", "dist", "pnpm-lock.json", "eslint.config.cjs", "test"],
  },
];
