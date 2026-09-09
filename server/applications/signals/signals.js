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

import { registerRoutes } from './routes';
import { getWatchStatusEmbeddableServerDefinition } from './embeddables/watch_status_embeddable_definition';
import { WATCH_STATUS_EMBEDDABLE_ID } from '../../../common/signals/constants';

export class Signals {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('signals');
  }

  /**
   * Registers the watch status dashboard panel on the server. Without this, Kibana's
   * dashboards REST API (/api/dashboards) rejects dashboards containing such panels.
   * The Dashboard UI itself does not need it. `embeddable` is an optional plugin dependency.
   */
  setup({ embeddable }) {
    if (!embeddable) {
      this.logger.warn(
        'The embeddable plugin is not available, the watch status dashboard panel will not be part of the dashboards REST API.'
      );
      return;
    }

    try {
      embeddable.registerEmbeddableServerDefinition(
        WATCH_STATUS_EMBEDDABLE_ID,
        getWatchStatusEmbeddableServerDefinition()
      );
    } catch (error) {
      this.logger.error(`Failed to register the watch status dashboard panel: ${error}`);
    }
  }

  start({ core, kibanaRouter, searchguardBackendService }) {
    this.logger.debug('Start app');

    try {
      this.clusterClient = core.elasticsearch.client;

      registerRoutes({
        router: kibanaRouter,
        searchguardBackendService,
        clusterClient: this.clusterClient,
        logger: this.coreContext.logger,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
