import { existsSync } from 'fs';
import path from 'path';

const kibanaExtraPath = path.join(__dirname, '../../../../kibana/src/legacy/server/saved_objects/migrations/kibana');
const kibanaPluginPath = '../../../../src/legacy/server/saved_objects/migrations/kibana';
const { KibanaMigrator } = existsSync(kibanaExtraPath) ?
  require(kibanaExtraPath) : require(kibanaPluginPath); // eslint-disable-line import/no-dynamic-require
export default KibanaMigrator;
