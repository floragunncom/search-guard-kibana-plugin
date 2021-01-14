/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fetchAllFromScroll } from '../lib';

import { registerWatchesRoutes } from './watches';
import { registerWatchRoutes } from './watch';
import { registerEsRoutes } from './es';
import { registerAlertsRoutes } from './alerts';
import { registerAlertRoutes } from './alert';
import { registerAccountsRoutes } from './accounts';
import { registerAccountRoutes } from './account';
import { registerSearchguardRoutes } from './searchguard';

export function registerRoutes({ router, clusterClient, logger, searchguardBackendService }) {
  registerWatchesRoutes({
    router,
    clusterClient,
    fetchAllFromScroll,
    logger: logger.get('signals-watches-routes'),
  });

  registerWatchRoutes({ router, clusterClient, logger: logger.get('signals-watch-routes') });

  registerEsRoutes({ router, clusterClient, logger: logger.get('signals-es-routes') });

  registerAlertsRoutes({
    router,
    clusterClient,
    fetchAllFromScroll,
    logger: logger.get('signals-alerts-routes'),
  });
  registerAlertRoutes({ router, clusterClient, logger: logger.get('signals-alert-routes') });

  registerAccountsRoutes({
    router,
    clusterClient,
    fetchAllFromScroll,
    logger: logger.get('signals-accounts-routes'),
  });

  registerAccountRoutes({ router, clusterClient, logger: logger.get('signals-account-routes') });

  registerSearchguardRoutes({
    router,
    clusterClient,
    searchguardBackendService,
    logger: logger.get('signals-searchguard-routes'),
  });
}
