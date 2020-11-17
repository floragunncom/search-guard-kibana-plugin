/* eslint-disable @kbn/eslint/require-license-header */
import { deleteAlertRoute } from './delete';

export function registerAlertRoutes({ router, clusterClient, logger }) {
  deleteAlertRoute({ router, clusterClient, logger });
}
