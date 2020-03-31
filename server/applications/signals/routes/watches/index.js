/* eslint-disable @kbn/eslint/require-license-header */
import { getWatchesRoute } from './get';

export function registerWatchesRoutes({ router, clusterClient }) {
  getWatchesRoute({ router, clusterClient });
}
