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

export const DEFAULT_SPACE_ID = 'space:default';

// ATTENTION! If either Saved Objects migration or integration with spaces doesn't work,
// check the space document structure in your Kibana version. Maybe it changed.
export function getDefaultSpaceDoc(kibanaVersion) {
  return {
    space: {
      name: 'Default',
      description: 'This is your default space!',
      disabledFeatures: [],
      color: '#00bfb3',
      _reserved: true,
    },
    type: 'space',
    references: [],
    managed: false,
    typeMigrationVersion: '6.6.0',
    coreMigrationVersion: kibanaVersion,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

export class SpacesService {
  constructor({ kibanaVersion, tenantService }) {
    this.kibanaVersion = kibanaVersion;
    this.tenantService = tenantService;
  }

  createDefaultSpace = async ({ request, selectedTenant = '' } = {}) => {
    const spaceExists = await this.tenantService.docExists({
      request,
      indexName: this.tenantService.aliasName,
      docId: DEFAULT_SPACE_ID,
    });

    if (!spaceExists) {
      return this.tenantService.createDoc({
        request,
        tenantName: selectedTenant,
        versionIndexName: this.tenantService.versionIndexName,
        docId: DEFAULT_SPACE_ID,
        docBody: getDefaultSpaceDoc(this.kibanaVersion),
      });
    }
  };
}
