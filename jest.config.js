const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
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
    // Extend the first node_modules pattern to also allow transforming `jose`.
    typeof pattern === "string" && pattern.includes("node_modules")
      ? pattern.replace("(?!(geist)/)", "(?!(geist|jose)/)")
      : pattern,
  );
  return config;
};
