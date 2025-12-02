module.exports = {
  // Test Environment
  testEnvironment: 'node',

  // Module File Extensions
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Root Directory
  rootDir: '.',

  // Test Match Patterns
  testRegex: '.*\\.spec\\.ts$',

  // Transform Configuration
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: {
        paths: {
          '@/*': ['src/*'],
          'src/*': ['src/*'],
        },
      },
    }],
  },

  // Coverage Configuration
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.enum.ts',
    '!src/main.ts',
    '!src/generated/**/*',
  ],

  // Coverage Directory
  coverageDirectory: 'coverage',

  // Coverage Reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Module Name Mapper (for path aliases)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // Test Timeout
  testTimeout: 30000,

  // Verbose Output
  verbose: true,

  // Clear Mocks
  clearMocks: true,

  // Restore Mocks
  restoreMocks: true,

  // Max Workers
  maxWorkers: '50%',

  // Ignore Patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/coverage/'],

  // Error on Deprecated
  errorOnDeprecated: false,

  // Notify Mode
  notify: false,

  // Bail on First Error (for CI)
  bail: false,
};
