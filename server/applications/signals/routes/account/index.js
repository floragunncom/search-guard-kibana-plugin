/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountRoute } from './get';
import { createAccountRoute } from './create';
import { deleteAccountRoute } from './delete';

export function registerAccountRoutes({ router, clusterClient, logger }) {
  getAccountRoute({ router, clusterClient, logger });
  createAccountRoute({ router, clusterClient, logger });
  deleteAccountRoute({ router, clusterClient, logger });
}
