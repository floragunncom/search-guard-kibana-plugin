/* eslint-disable @kbn/eslint/require-license-header */
import { fetchAllFromScroll } from '../lib/fetch_all_from_scroll';

import { registerWatchesRoutes } from './watches';
import { registerWatchRoutes } from './watch';
import { registerEsRoutes } from './es';
import { registerAlertsRoutes } from './alerts';
import { registerAlertRoutes } from './alert';
import { registerAccountsRoutes } from './accounts';
import { registerAccountRoutes } from './account';
import { registerSearchguardRoutes } from './searchguard';

export function registerRoutes({
  router,
  clusterClient,
  logger,
  searchguardBackendService,
}) {
  registerWatchesRoutes({
    router,
    clusterClient,
    fetchAllFromScroll,
    logger: logger.get('watches-routes'),
  });

  registerWatchRoutes({ router, clusterClient, logger: logger.get('watch-routes') });

  registerEsRoutes({ router, clusterClient, logger: logger.get('es-routes') });

  registerAlertsRoutes({
    router,
    clusterClient,
    fetchAllFromScroll,
    logger: logger.get('alerts-routes'),
  });
  registerAlertRoutes({ router, clusterClient, logger: logger.get('alert-routes') });

  registerAccountsRoutes({
    router,
    clusterClient,
    fetchAllFromScroll,
    logger: logger.get('accounts-routes'),
  });

  registerAccountRoutes({ router, clusterClient, logger: logger.get('account-routes') });

  registerSearchguardRoutes({
    router,
    clusterClient,
    searchguardBackendService,
    logger: logger.get('searchguard-routes'),
  });
}
