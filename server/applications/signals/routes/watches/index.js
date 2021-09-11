/* eslint-disable @osd/eslint/require-license-header */
import { getWatchesRoute } from './get';

export function registerWatchesRoutes({ router, clusterClient, fetchAllFromScroll, logger }) {
  getWatchesRoute({ router, clusterClient, fetchAllFromScroll, logger });
}
