/* eslint-disable @kbn/eslint/require-license-header */
import { getAlertsRoute } from './get';

export function registerAlertsRoutes({ hapiServer, clusterClient, fetchAllFromScroll, logger }) {
  getAlertsRoute({ hapiServer, clusterClient, fetchAllFromScroll, logger });
}
