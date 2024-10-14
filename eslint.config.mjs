import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: parser,
      sourceType: "module",
      ecmaVersion: "latest",
    },
    plugins: {
      react: pluginReact,
      prettier: pluginPrettier,
      "@typescript-eslint": pluginTypeScript,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          singleQuote: true,
          trailingComma: "none",
          bracketSpacing: true,
          arrowParens: "avoid",
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
