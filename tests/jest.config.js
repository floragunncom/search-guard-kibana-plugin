/* eslint-disable @kbn/eslint/require-license-header */
module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/tests/setup_tests.js'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: true,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '!!raw-loader!./worker.js': '<rootDir>/__mocks__/raw_loader.js',
    'ui/chrome': '<rootDir>/__mocks__/chrome.js',
    '\\.svg': '<rootDir>/__mocks__/svg_mock.js',
    'uuid': require.resolve('uuid'), // see: https://stackoverflow.com/questions/73203367/jest-syntaxerror-unexpected-token-export-with-uuid-library
  },
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  modulePaths: ['node_modules', '../../node_modules'],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'cobertura'],
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.{js}',
    '!**/node_modules/**',
    '!**/index.js',
    '!<rootDir>/tests/**',
    '!<rootDir>/public/apps/configuration',
    '!<rootDir>/lib/**',
    '!<rootDir>/server/**',
    '!<rootDir>/coverage/**',
    '!<rootDir>/scripts/**',
    '!<rootDir>/build/**',
    '!<rootDir>/gather-info.js',
    '!**/vendor/**',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/build_stage/',
    '<rootDir>/build/',
    '<rootDir>/node_modules/',
  ],
};
