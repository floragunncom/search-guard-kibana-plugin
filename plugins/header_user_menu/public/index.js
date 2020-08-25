/* eslint-disable @kbn/eslint/require-license-header */
import { PublicPlugin } from './PublicPlugin';

export function plugin(initializerContext) {
  return new PublicPlugin(initializerContext);
}
