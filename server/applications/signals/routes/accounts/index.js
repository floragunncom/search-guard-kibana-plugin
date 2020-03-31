/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountsRoute } from './get';

export function registerAccountsRoutes({ hapiServer, clusterClient }) {
  getAccountsRoute({ hapiServer, clusterClient });
}
