import { fixupConfigRules } from "@eslint/compat";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const config = [
  {
    ignores: ["tailwind.config.ts", ".next/**", "node_modules/**"],
  },
  ...fixupConfigRules([...coreWebVitals, ...typescript]),
  prettierRecommended,
  {
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
];

export default config;
