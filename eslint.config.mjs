import js from "@eslint/js";
import parser from "@typescript-eslint/parser";
import plugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.vitepress/**",
      "**/coverage/**",
      "**/docs/**",
      "build.js",
      "eslint.config.mjs",
      "utils/mock.helpers.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
      },
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": plugin,
    },
    rules: {
      ...plugin.configs.recommended.rules,

      // Pragmatic relaxations
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/adjacent-overload-signatures": "off",
      "@typescript-eslint/no-redeclare": "off",
      "@typescript-eslint/no-empty-object-types": "off",
      "no-redeclare": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Don't nitpick test files
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-useless-escape": "off",
    },
  },
];
