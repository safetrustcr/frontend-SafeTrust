module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',      
    'components/**/*.{js,jsx,ts,tsx}',
    'core/**/*.{js,jsx,ts,tsx}',     
    'services/**/*.{js,jsx,ts,tsx}', 
    '!**/__tests__/**',              
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  moduleNameMapper: {
    // Handle module aliases (if you use them in your app)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true, 
          },
          transform: {
            react: {
              runtime: 'automatic', 
            },
          },
        },
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  reporters: [
    'default',
    process.env.CI === 'true' ? 'jest-junit' : null,
  ].filter(Boolean),
};
