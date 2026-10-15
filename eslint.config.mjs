import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "src/graphql/generated/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["jest.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Global module boundary escape prevention: relative imports escaping modules are banned
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../../*"],
              message: "Use the @/ alias.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/(bg|text|border|ring|fill|stroke)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "Use a design token (bg-primary, text-muted-foreground, …) instead of a hex colour.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/mockData*", "@/lib/demo*"],
              message:
                "Direct mock/demo data imports are restricted to explicit legacy pages.",
            },
            {
              group: ["../../../*"],
              message: "Use the @/ alias.",
            },
          ],
        },
      ],
    },
  },
  // components/ui: pure presentational (see docs/ARCHITECTURE.md)
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*",
                "@/hooks/*",
                "@/providers/*",
                "@/server/*",
                "@/lib/mockData*",
                "@/lib/demo*",
              ],
              message:
                "components/ui must stay presentational (see docs/ARCHITECTURE.md).",
            },
            {
              group: ["../../../*"],
              message: "Use the @/ alias.",
            },
          ],
        },
      ],
    },
  },
  // features: no deep imports into other features, never server/ or app/
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import another feature through its index.ts.",
            },
            {
              group: ["@/server/*", "@/app/*"],
              message: "Features cannot reach server/ or app/.",
            },
            {
              group: ["../../../*"],
              message: "Use the @/ alias.",
            },
          ],
        },
      ],
    },
  },
  // lib: framework-free, shared library
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/components/*", "@/server/*"],
              message: "lib/ is shared and must not depend on features or UI.",
            },
            {
              group: ["../../../*"],
              message: "Use the @/ alias.",
            },
          ],
        },
      ],
    },
  },
  // Temporary allowlist: ThemeToggle uses useTheme hook.
  // Follow-up issue FE-54 will relocate or refactor theme providers/hooks.
  {
    files: ["src/components/ui/ThemeToggle.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Temporary allowlist for legacy lib/ files importing components.
  // Each entry is tracked by a follow-up architecture migration issue:
  // - FE-48 / FE-54: wallet kit and wallet status migration to features/auth or server/
  // - FE-50: demo data and mock offers consolidation into features
  // - FE-58: co-located unit test migrations
  {
    files: [
      "src/lib/stellar/wallet-status.ts",
      "src/lib/stellar/wallet-status.test.ts",
      "src/lib/stellar/wallet-kit.ts",
      "src/lib/demo/index.ts",
      "src/lib/format.test.ts",
      "src/lib/mockData/offers.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["src/hooks/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // Explicit legacy/demo pages may consume demo/mock data directly. Dynamic
    // route segments escape their brackets
    // (\\[id\\]) because a bare [id] is a minimatch character class and never
    // matches a literal "[id]" path segment.
    files: [
      "src/app/dashboard/escrow-dashboard/RoleEscrowDashboardPage.tsx",
      "src/app/dashboard/escrow/\\[id\\]/page.tsx",
      "src/app/dashboard/favorites/page.tsx",
      "src/app/guest/suggestions/page.tsx",
      "src/app/hotels/\\[id\\]/book/page.tsx",
      "src/app/hotels/\\[id\\]/page.tsx",
      "src/app/hotels/search/page.tsx",
      "src/app/rent/\\[id\\]/escrow/\\[escrowId\\]/page.tsx",
      "src/app/rent/\\[id\\]/escrow/create/page.tsx",
      "src/app/rent/\\[id\\]/page.tsx",
      "src/app/rent/page.tsx",
      "src/app/room/page.tsx",
      "src/components/dashboard/WishlistCard.tsx",
      "src/components/dashboard/guest/GuestDashboard.tsx",
      "src/components/hotels/overall/HotelGrid.tsx",
      "src/components/listings/BedroomTabs.tsx",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    // Tests and test fixtures set process.env deliberately. Runtime config
    // belongs in config/, server-only modules, framework config, or instrumentation.
    ignores: [
      "src/config/**",
      "src/server/**",
      "next.config.ts",
      "instrumentation.ts",
      "src/instrumentation*.ts",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/__tests__/**",
      "**/testing/**",
      "jest.setup.ts",
      "playwright.config.ts",
      "e2e/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            "Read environment variables through the validated config module.",
        },
        {
          selector:
            "Literal[value=/(bg|text|border|ring|fill|stroke)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "Use a design token (bg-primary, text-muted-foreground, …) instead of a hex colour.",
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/app/api/**",
      "src/server/**",
      "src/config/**",
      "src/instrumentation*.ts",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/__tests__/**",
      "**/testing/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env']",
          message:
            "Read environment variables through the validated config module.",
        },
        {
          selector: "ImportDeclaration[source.value=/^@\\/server(\\/.*)?$/]",
          message:
            "Server-only modules may only be imported by API routes or src/server/.",
        },
        {
          selector:
            "Literal[value=/(bg|text|border|ring|fill|stroke)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "Use a design token (bg-primary, text-muted-foreground, …) instead of a hex colour.",
        },
      ],
    },
  },
  {
    files: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "src/**/__tests__/**/*.{ts,tsx}",
      "src/**/testing/**/*.{ts,tsx}",
    ],
    ignores: ["src/app/api/**", "src/server/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^@\\/server(\\/.*)?$/]",
          message:
            "Server-only modules may only be imported by API routes or src/server/.",
        },
        {
          selector:
            "Literal[value=/(bg|text|border|ring|fill|stroke)-\\[#[0-9a-fA-F]{3,8}\\]/]",
          message:
            "Use a design token (bg-primary, text-muted-foreground, …) instead of a hex colour.",
        },
      ],
    },
  },
  {
    files: ["src/config/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^@\\/server(\\/.*)?$/]",
          message:
            "Server-only modules may only be imported by API routes or src/server/.",
        },
      ],
    },
  },
  {
    files: ["instrumentation.ts", "src/instrumentation*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[source.value=/^@\\/server(\\/.*)?$/]",
          message:
            "Server-only modules may only be imported by API routes or src/server/.",
        },
      ],
    },
  },
];

export default eslintConfig;
