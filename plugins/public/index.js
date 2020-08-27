/* eslint-disable @kbn/eslint/require-license-header */
import { PublicPlugin } from './publicPlugin';

export function plugin(initializerContext) {
  return new PublicPlugin(initializerContext);
}
