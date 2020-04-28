/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountsRoute } from './get';

export function registerAccountsRoutes({ hapiServer, clusterClient, fetchAllFromScroll, logger }) {
  getAccountsRoute({ hapiServer, clusterClient, fetchAllFromScroll, logger });
}
