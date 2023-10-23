/* eslint-disable @kbn/eslint/require-license-header */
module.exports = {
  preset: '@kbn/test/jest_node',
  rootDir: '../../..',
  roots: ['<rootDir>/plugins/search-guard'],
  moduleNameMapper: {
	// XXX: We should not use moduleNameMapper due to its performance impact. We should try to replace this by other solutions
    '!!raw-loader!./worker.js': '<rootDir>/plugins/search-guard/__mocks__/raw_loader.js',
    'ui/chrome': '<rootDir>/plugins/search-guard/__mocks__/chrome.js',
    '\\.svg': '<rootDir>/plugins/search-guard/__mocks__/svg_mock.js',
  },
}