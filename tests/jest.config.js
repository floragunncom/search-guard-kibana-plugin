module.exports = {
  rootDir: '../',
  setupFiles: [
    '<rootDir>/tests/setup_tests.js',
  ],
  testMatch: ['**/*.test.js'],
  modulePaths: ['node_modules', `../../kibana/node_modules`],
  snapshotSerializers: ['../../kibana/node_modules/enzyme-to-json/serializer'],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'cobertura'],
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.js$': 'babel-jest'
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
  ]
};
