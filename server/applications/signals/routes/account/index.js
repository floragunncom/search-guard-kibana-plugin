/* eslint-disable @kbn/eslint/require-license-header */
import { getAccountRoute } from './get';
import { createAccountRoute } from './create';
import { deleteAccountRoute } from './delete';

export function registerAccountRoutes({ hapiServer, clusterClient }) {
  getAccountRoute({ hapiServer, clusterClient });
  createAccountRoute({ hapiServer, clusterClient });
  deleteAccountRoute({ hapiServer, clusterClient });
}
