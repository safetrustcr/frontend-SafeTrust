const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  rootDir: ".",
  roots: ["<rootDir>/src", "<rootDir>/__mocks__"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@creit[.]tech/stellar-wallets-kit/types$":
      "<rootDir>/node_modules/@creit.tech/stellar-wallets-kit/types.cjs",
    "^server-only$": "<rootDir>/__mocks__/server-only.js",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  modulePathIgnorePatterns: ["<rootDir>/e2e/"],
};

// next/jest merges transformIgnorePatterns at resolution time.
// We post-process the resolved config to add `jose` (ESM-only package) so
// the SWC transformer picks it up instead of the default node_modules ignore.
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  const existing = config.transformIgnorePatterns ?? [];
  config.transformIgnorePatterns = existing.map((pattern) =>
    // Extend the first node_modules pattern for ESM-only dependencies.
    typeof pattern === "string" && pattern.includes("node_modules")
      ? pattern.replace(
          "(?!(geist)/)",
          "(?!(geist|jose|react-markdown|remark-[^/]+|unified|mdast-util-[^/]+|micromark[^/]*|unist-util-[^/]+|hast-util-[^/]+|estree-util-[^/]+|vfile[^/]*|bail|devlop|extend|is-plain-obj|trough|character-entities|decode-named-character-reference|ccount|escape-string-regexp|trim-lines|longest-streak|html-void-elements|html-url-attributes|markdown-table|property-information|space-separated-tokens|comma-separated-tokens|zwitch)/)",
        )
      : pattern,
  );
  return config;
};
