/* eslint-disable @osd/eslint/require-license-header */
import { hasPermissionsRoute } from './has_permissions';

export function registerSearchguardRoutes({
  router,
  clusterClient,
  logger,
  searchguardBackendService,
}) {
  hasPermissionsRoute({ router, clusterClient, logger, searchguardBackendService });
}
