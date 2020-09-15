/* eslint-disable @kbn/eslint/require-license-header */
const execa = require('execa');
const optimizer = require('@kbn/optimizer');
const devUtils = require('@kbn/dev-utils');
const path = require('path');

function runOptimizer() {
  const log = new devUtils.ToolingLog({
    level: 'verbose',
    writeTo: process.stdout,
  });

  const pluignRoot = path.resolve(__dirname, '..');
  log.info(`Start running JS optimization for plugin at ${pluignRoot}`);

  const config = optimizer.OptimizerConfig.create({
    repoRoot: devUtils.REPO_ROOT,
    watch: false,
    // oss: true,
    dist: true,
    pluginPaths: [pluignRoot], // specify to build current plugin
    pluginScanDirs: [], // set pluginScanDirs to empty to skip building of other plugins
    cache: false,
  });

  return optimizer.runOptimizer(config).pipe(optimizer.logOptimizerState(log, config)).toPromise();
}

async function build() {
  const pluginRoot = process.cwd();

  console.log('Building plugin...');
  console.log(`CWD: ${pluginRoot}`);

  // clean up target dir
  console.log('Cleaning up target directory...');
  execa.sync('rm', ['-rf', 'target']);
  execa.sync('rm', ['-rf', 'build']);

  // optimize browser application
  console.log('Exectuing optimizer...');
  try {
    await runOptimizer();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

(async function () {
  try {
    await build();
  } catch (error) {
    console.error(error);
  }
})();
