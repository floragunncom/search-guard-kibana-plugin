/* eslint-disable @osd/eslint/require-license-header */
import { hasPermissionsRoute } from './has_permissions';

export function registerSecurityRoutes({
  router,
  clusterClient,
  logger,
  eliatraSuiteBackendService,
}) {
  hasPermissionsRoute({ router, clusterClient, logger, eliatraSuiteBackendService });
}
