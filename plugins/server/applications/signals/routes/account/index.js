/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountRoute } from './get';
import { createAccountRoute } from './create';
import { deleteAccountRoute } from './delete';

export function registerAccountRoutes({ hapiServer, clusterClient, logger }) {
  getAccountRoute({ hapiServer, clusterClient, logger });
  createAccountRoute({ hapiServer, clusterClient, logger });
  deleteAccountRoute({ hapiServer, clusterClient, logger });
}
