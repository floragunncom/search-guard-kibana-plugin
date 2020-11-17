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
import { migrateTenants } from './migrate';
import {
  setupLoggerMock,
  setupHttpResponseMock,
  setupSearchGuardBackendMock,
} from '../../../mocks';

function setupMigrationEsClientMock() {
  return jest.fn();
}

function setupKibanaConfigMock() {
  return {
    enabled: true,
    index: '.kibana',
  };
}

function setupSavedObjectsConfigMock() {
  return {
    batchSize: 100,
    scrollDuration: '15m',
    pollInterval: 1500,
    skip: false,
  };
}

function setupSavedObjectValidationsMock() {
  return {};
}

function setupTypeRegistryMock() {
  // All the registered Saved Objects docs
  return {
    types: new Map([
      [
        'visualization',
        {
          name: 'visualization',
          hidden: false,
          namespaceType: 'single',
          management: {
            icon: 'visualizeApp',
            defaultSearchField: 'title',
            importableAndExportable: true,
          },
          mappings: {
            properties: {
              description: {
                type: 'text',
              },
              kibanaSavedObjectMeta: {
                properties: {
                  searchSourceJSON: {
                    type: 'text',
                  },
                },
              },
              savedSearchRefName: {
                type: 'keyword',
              },
              title: {
                type: 'text',
              },
              uiStateJSON: {
                type: 'text',
              },
              version: {
                type: 'integer',
              },
              visState: {
                type: 'text',
              },
            },
          },
          migrations: {}, // Kibana puts migrated doc hashes here
        },
      ],
      ['server', {}],
      ['timelion-sheet', {}],
    ]),
  };
}

function setupKibanaMigratorMock({ runMigrations = jest.fn() } = {}) {
  return jest.fn(() => ({ runMigrations }));
}

const kibanaVersion = '8.0.0';

const migratorDeps = {
  client: setupMigrationEsClientMock(),
  kibanaConfig: setupKibanaConfigMock(),
  typeRegistry: setupTypeRegistryMock(),
  logger: setupLoggerMock(),
  savedObjectsConfig: setupSavedObjectsConfigMock(),
  savedObjectValidations: setupSavedObjectValidationsMock(),
  kibanaVersion,
};

describe('multitenancy/routes/migrate', () => {
  describe('errors', () => {
    test('throw error if no tenant', async () => {
      const searchGuardBackend = setupSearchGuardBackendMock();
      const KibanaMigrator = setupKibanaMigratorMock();
      const response = setupHttpResponseMock();

      const request = { params: {} };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
      })(null, request, response);

      expect(response.badRequest).toHaveBeenCalledWith({
        body: new Error('Tenant index name is required as the request parameter.'),
      });
    });

    test('throw error if no indices found', async () => {
      const KibanaMigrator = setupKibanaMigratorMock();
      const response = setupHttpResponseMock();

      const searchGuardBackend = setupSearchGuardBackendMock({
        getTenantInfoWithInternalUser: jest.fn().mockResolvedValue({}),
      });

      const request = { params: { tenantIndex: 'kibana_3568561_trex' } };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
      })(null, request, response);

      expect(response.customError).toHaveBeenCalledWith({
        statusCode: 503,
        body: new Error('No tenant indices have been found. Migration is not triggered.'),
      });
    });

    test('throw error if no tenant index found', async () => {
      const KibanaMigrator = setupKibanaMigratorMock();
      const response = setupHttpResponseMock();

      const searchGuardBackend = setupSearchGuardBackendMock({
        getTenantInfoWithInternalUser: jest.fn().mockResolvedValue({
          '.kibana_-152937574_admintenant': 'admin_tenant',
        }),
      });

      const tenantIndex = 'kibana_3568561_trex';
      const request = { params: { tenantIndex } };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
      })(null, request, response);

      expect(response.customError).toHaveBeenCalledWith({
        statusCode: 503,
        body: new Error(
          `The tenant's index "${tenantIndex}" has not been found. Check if the index name is correct.`
        ),
      });
    });

    test('throw error', async () => {
      const KibanaMigrator = setupKibanaMigratorMock();
      const response = setupHttpResponseMock();

      const error = new Error('nasty!');
      const searchGuardBackend = setupSearchGuardBackendMock({
        getTenantInfoWithInternalUser: jest.fn().mockRejectedValue(error),
      });

      const tenantIndex = 'kibana_3568561_trex';
      const request = { params: { tenantIndex } };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
      })(null, request, response);

      expect(response.internalError).toHaveBeenCalledWith({ body: error });
    });
  });

  test('can migrate saved objects', async () => {
    const response = setupHttpResponseMock();

    const inputs = [
      {
        name: 'migrate a tenant index',
        request: {
          params: { tenantIndex: '.kibana_3568561_trex' },
        },
        expectedResponse: [
          {
            status: 'skipped',
          },
        ],
        runMigrationsResponse: [{ status: 'skipped' }],
        getTenantInfoWithInternalUserResponse: {
          '.kibana_-152937574_admintenant': 'admin_tenant',
          '.kibana_3568561_trex': 'trex',
        },
      },
      {
        name: 'migrate all tenants indices',
        request: {
          params: { tenantIndex: '_all' },
        },
        expectedResponse: [
          [
            {
              status: 'skipped',
            },
          ],
          [
            {
              status: 'skipped',
            },
          ],
        ],
        runMigrationsResponse: [{ status: 'skipped' }],
        getTenantInfoWithInternalUserResponse: {
          '.kibana_-152937574_admintenant': 'admin_tenant',
          '.kibana_3568561_trex': 'trex',
        },
      },
    ];

    for (const input of inputs) {
      const {
        request,
        expectedResponse,
        getTenantInfoWithInternalUserResponse,
        runMigrationsResponse,
      } = input;

      const KibanaMigrator = setupKibanaMigratorMock({
        runMigrations: jest.fn().mockResolvedValue(runMigrationsResponse),
      });

      const searchGuardBackend = setupSearchGuardBackendMock({
        getTenantInfoWithInternalUser: jest
          .fn()
          .mockResolvedValue(getTenantInfoWithInternalUserResponse),
      });

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
      })(null, request, response);

      expect(response.ok).toHaveBeenCalledWith({ body: expectedResponse });
    }
  });
});
