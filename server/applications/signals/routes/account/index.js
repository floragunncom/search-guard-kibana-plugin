/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountRoute } from './get';
import { createAccountRoute } from './create';
import { deleteAccountRoute } from './delete';

export function registerAccountRoutes({ router, clusterClient, logger, configService }) {
  getAccountRoute({ router, clusterClient, logger, configService });
  createAccountRoute({ router, clusterClient, logger, configService });
  deleteAccountRoute({ router, clusterClient, logger, configService });
}
