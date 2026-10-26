/* eslint-disable @kbn/eslint/require-license-header */
const path = require('path');

// The Kibana tree this plugin is checked out in (kibana/plugins/search-guard).
// Absolute, because jest resolves presets of project configs against rootDir.
const rootDir = path.resolve(__dirname, '../../..');

const base = {
  rootDir,
  roots: ['<rootDir>/plugins/search-guard'],
  moduleNameMapper: {
	// XXX: We should not use moduleNameMapper due to its performance impact. We should try to replace this by other solutions
    '!!raw-loader!./worker.js': '<rootDir>/plugins/search-guard/__mocks__/raw_loader.js',
    'ui/chrome': '<rootDir>/plugins/search-guard/__mocks__/chrome.js',
    '\\.svg': '<rootDir>/plugins/search-guard/__mocks__/svg_mock.js',
  },
};

// Public setup tests (public/**/*.setup.test.js) exercise the plugin against
// Kibana's own browser mocks, which need a DOM. They run with Kibana's jsdom
// preset; everything else keeps running in node.
const publicSetupTests = '<rootDir>/plugins/search-guard/public/**/*.setup.test.js';

module.exports = {
  projects: [
    {
      ...base,
      displayName: 'node',
      preset: '@kbn/test/jest_node',
      // testMatch instead of testPathIgnorePatterns: CI passes --testPathIgnorePatterns
      // on the command line, which replaces the configured patterns.
      testMatch: ['**/*.test.{js,mjs,ts,tsx}', '!**/*.setup.test.js'],
    },
    {
      ...base,
      displayName: 'jsdom',
      preset: '@kbn/test',
      testMatch: [publicSetupTests],
    },
    {
      ...base,
      displayName: 'node-setup',
      preset: '@kbn/test/jest_node',
      testMatch: ['<rootDir>/plugins/search-guard/server/**/*.setup.test.js'],
    },
  ],
};
