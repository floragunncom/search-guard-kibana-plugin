/* eslint-disable @kbn/eslint/require-license-header */
import { registerWatchesRoutes } from './watches';
import { registerWatchRoutes } from './watch';
import { registerEsRoutes } from './es';
import { registerAlertsRoutes } from './alerts';
import { registerAlertRoutes } from './alert';
import { registerAccountsRoutes } from './accounts';
import { registerAccountRoutes } from './account';

export function registerRoutes({ router, hapiServer, clusterClient }) {
  registerWatchesRoutes({ router, clusterClient });
  registerWatchRoutes({ router, clusterClient });
  // TODO: refactor the routes below to the New Platform
  registerEsRoutes({ hapiServer, clusterClient });
  registerAlertsRoutes({ hapiServer, clusterClient });
  registerAlertRoutes({ hapiServer, clusterClient });
  registerAccountsRoutes({ hapiServer, clusterClient });
  registerAccountRoutes({ hapiServer, clusterClient });
}
