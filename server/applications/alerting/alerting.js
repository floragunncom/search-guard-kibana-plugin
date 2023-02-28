/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
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

export class Alerting {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.logger = coreContext.logger.get('alerting');
  }

  start({ core, kibanaRouter, eliatraSuiteBackendService }) {
    this.logger.debug('Start app');

    try {
      this.clusterClient = core.opensearch.client;

      registerRoutes({
        router: kibanaRouter,
        eliatraSuiteBackendService,
        clusterClient: this.clusterClient,
        logger: this.coreContext.logger,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
