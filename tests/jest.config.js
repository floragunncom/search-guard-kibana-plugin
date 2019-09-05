module.exports = {
  rootDir: '../',
  setupFiles: [
    '<rootDir>/tests/setup_tests.js',
  ],
  globals: {
    'ts-jest': {
      'tsConfig': 'tsconfig.json',
      'diagnostics': true
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  modulePaths: ['node_modules', '../../node_modules'],
  snapshotSerializers: ['../../node_modules/enzyme-to-json/serializer'],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'cobertura'],
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.ts?$': 'ts-jest'
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
    '!**/vendor/**'
  ],
  modulePathIgnorePatterns: ['<rootDir>/build_stage/', '<rootDir>/build/', '<rootDir>/node_modules/']
};
