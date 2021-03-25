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

import { get, head } from 'lodash';

const DEFAULT_SPACE_ID = 'space:default';
// If the spaces doesn't work, check the default doc structure
// in the Kibana version you use. Maybe the doc changed.
const DEFAULT_SPACE_DOC = {
  type: 'space',
  space: {
    name: 'Default',
    description: 'This is your default space!',
    disabledFeatures: [],
    color: '#00bfb3',
    _reserved: true,
  },
  updated_at: new Date().toISOString(),
};

export class SpacesService {
  constructor({ clusterClient, logger, configService }) {
    this.clusterClient = clusterClient;
    this.logger = logger;
    this.configService = configService;
    this.kibanaIndex = this.configService.get('kibana.index');
  }

  createDefaultSpace = async ({ request, selectedTenant = '' } = {}) => {
    // Kibana talks to its index. The SG ES plugin substitutes the Kibana index name with a tenant index name.
    try {
      await this.clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/${this.kibanaIndex}/_doc/${DEFAULT_SPACE_ID}`,
      });
    } catch (error) {
      if (error.meta.statusCode === 404) {
        try {
          await this.clusterClient.asScoped(request).asCurrentUser.create({
            id: DEFAULT_SPACE_ID,
            index: this.kibanaIndex,
            refresh: true,
            body: DEFAULT_SPACE_DOC,
          });

          this.logger.debug(`Created the default space for tenant "${selectedTenant}"`);
        } catch (error) {
          if (error.meta.statusCode !== 409) {
            this.logger.error(
              `Failed to create the default space for tenant "${selectedTenant}", ${JSON.stringify(
                get(error, 'meta.body', {}),
                null,
                2
              )}`
            );
          }
        }
      } else {
        this.logger.error(
          `Failed to check the default space for tenant "${selectedTenant}", ${JSON.stringify(
            get(error, 'meta.body', {}),
            null,
            2
          )}`
        );
      }
    }
  };
}
