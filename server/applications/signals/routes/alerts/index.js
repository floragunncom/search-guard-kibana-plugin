/* eslint-disable @osd/eslint/require-license-header */
import { getAlertsRoute } from './get';

export function registerAlertsRoutes({ router, clusterClient, fetchAllFromScroll, logger }) {
  getAlertsRoute({ router, clusterClient, fetchAllFromScroll, logger });
}
