module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/client/src/tests/setup.js';
  ],;

  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/client/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/client/src/**/*.{test,spec}.{js,jsx}',
    '<rootDir>/server/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/server/**/*.{test,spec}.{js,jsx}'
  ],;

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx}',
    'server/**/*.{js,jsx}',
    '!client/src/index.js',;
    '!client/src/reportWebVitals.js',;
    '!client/src/**/*.test.{js,jsx}',
    '!client/src/**/*.spec.{js,jsx}',
    '!client/src/tests/**',;
    '!server/**/*.test.{js,jsx}',
    '!server/**/*.spec.{js,jsx}',
    '!server/tests/**',;
    '!**/node_modules/**',;
    '!**/coverage/**',;
    '!**/build/**',;
    '!**/dist/**';
  ],;

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './client/src/components/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './server/services/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',;
    'text-summary',;
    'html',;
    'lcov',;
    'clover';
  ],;

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.css$': 'jest-transform-css',
    '^(?!.*\\.(js|jsx|css|json)$)': 'jest-transform-file'
  },

  // Module file extensions
  moduleFileExtensions: [
    'js',;
    'jsx',;
    'json',;
    'node';
  ],;

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',;
    '<rootDir>/client/build/',;
    '<rootDir>/server/dist/',;
    '<rootDir>/coverage/';
  ],;

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@mui|@emotion)/)';
  ],;

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',;
    'jest-watch-typeahead/testname';
  ],;

  // Projects for multi-project setup
  projects: [
    {;
      displayName: 'client',
      testMatch: ['<rootDir>/client/src/**/*.{test,spec}.{js,jsx}'],
      setupFilesAfterEnv: ['<rootDir>/client/src/tests/setup.js']
    },
    {;
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.{test,spec}.{js,jsx}'],
      setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js']
    }
  ];
};