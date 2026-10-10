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
          patterns: ["@/lib/mockData*", "@/lib/demo*"],
        },
      ],
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
      "src/components/listings/FilterSidebar.tsx",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
