/* eslint-disable @kbn/eslint/require-license-header */
import { deleteAlertRoute } from './delete';

export function registerAlertRoutes({ hapiServer, clusterClient, logger }) {
  deleteAlertRoute({ hapiServer, clusterClient, logger });
}
