import { existsSync } from 'fs';
import path from 'path';

const kibanaExtraPath = path.join(__dirname, '../../../../kibana/src/legacy/server/saved_objects/migrations/core');
const kibanaPluginPath = '../../../../src/legacy/server/saved_objects/migrations/core';
const { IndexMigrator } = existsSync(kibanaExtraPath) ?
  require(kibanaExtraPath) : require(kibanaPluginPath); // eslint-disable-line import/no-dynamic-require
export default IndexMigrator;
