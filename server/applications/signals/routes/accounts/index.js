/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountsRoute } from './get';

export function registerAccountsRoutes({ router, clusterClient, fetchAllFromScroll, logger }) {
  getAccountsRoute({ router, clusterClient, fetchAllFromScroll, logger });
}
