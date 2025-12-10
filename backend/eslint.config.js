// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "@eslint/js";

export default defineConfig(
  // Core Recommended Rules
  js.configs.recommended,                                             // Standard JavaScript best practices

  // TypeScript Strict Type-Checked Rules
  ...tseslint.configs.strictTypeChecked,                              // Enable type-aware linting (requires tsconfig)

  // Prettier Integration
  prettier,                                                           // Disable all ESLint stylistic rules that conflict with Prettier

  // Project-Wide Configuration
  {
    // Language & Parser Options
    languageOptions: {
      parser: tseslint.parser,                                        // Explicit TypeScript parser (required in flat config)
      parserOptions: {
        project: true,                                                // Enable project-based type checking
        tsconfigRootDir: import.meta.dirname,                         // Resolve tsconfig relative to this file
      },
      globals: {
        console: "readonly",                                          // Allow console access without redefinition
        process: "readonly",                                          // Node.js process object
        NodeJS: "readonly",                                           // NodeJS namespace (e.g., for types)
      },
    },

    // Linter Rules (Organized by Category)
    rules: {
      // Control Flow & Readability
      "no-else-return": ["error", { allowElseIf: false }],            // Disallow 'else' after 'return' (promotes early returns)
      "prefer-const": "error",                                        // Enforce 'const' when possible
      "no-var": "error",                                              // Disallow 'var' keyword, enforce 'let' or 'const'

      // Console & Debugging
      "no-console": ["warn", { allow: ["warn", "error"] }],           // Allow 'console.warn' and 'console.error' without warnings

      // TypeScript-Specific Rules (Type Safety First)
      "@typescript-eslint/explicit-function-return-type": "error",    // Require explicit return types on functions
      "@typescript-eslint/no-explicit-any": "error",                  // Disallow 'any' type
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",                                    // Allow unused args prefixed with '_'
          varsIgnorePattern: "^_",                                    // Allow unused vars prefixed with '_'
        },
      ],

      // Future-Proofing / Intentional Off Switches
      "@typescript-eslint/prefer-ts-expect-error": "error",           // Prefer '@ts-expect-error' over '@ts-ignore'
      "no-implicit-globals": "error",                                 // Disallow implicit global variables
    },

    // File Inclusion Patterns
    files: ["**/*.{ts,tsx,mts,cts}"],                                 // Apply to all TypeScript files
    ignores: ["dist/", "node_modules/", "**/*.js", "**/*.mjs"],       // Exclude certain files
  }
);