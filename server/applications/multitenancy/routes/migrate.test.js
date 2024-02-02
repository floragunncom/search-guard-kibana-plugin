/*
 *    Copyright 2021 floragunn GmbH
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
} from '../../../utils/mocks';

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

function setupKibanaMigratorMock({
  runMigrations = jest.fn(),
  prepareMigrations = jest.fn(),
} = {}) {
  return jest.fn(() => ({ runMigrations, prepareMigrations }));
}

function setupDocLinksServiceMock({
 start = jest.fn(),
 setup = jest.fn(),
} = {}) {
  return {
    start,
    setup
  };
}

const kibanaVersion = '8.0.0';

const migratorDeps = {
  client: setupMigrationEsClientMock(),
  kibanaConfig: setupKibanaConfigMock(),
  typeRegistry: setupTypeRegistryMock(),
  logger: setupLoggerMock(),
  soMigrationsConfig: setupSavedObjectsConfigMock(),
  kibanaVersion,
};

describe('multitenancy/routes/migrate', () => {
  describe('errors', () => {
    test('throw error if no tenant', async () => {
      const searchGuardBackend = setupSearchGuardBackendMock();
      const KibanaMigrator = setupKibanaMigratorMock();
      const response = setupHttpResponseMock();
      const docLinksService = setupDocLinksServiceMock();

      const request = { params: {} };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
        docLinksService
      })(null, request, response);

      expect(response.badRequest).toHaveBeenCalledWith({
        body: new Error('Tenant index name is required as the request parameter.'),
      });
    });

    test('throw error if no indices found', async () => {
      const KibanaMigrator = setupKibanaMigratorMock();
      const response = setupHttpResponseMock();
      const docLinksService = setupDocLinksServiceMock();
      const searchGuardBackend = setupSearchGuardBackendMock({
        getTenantInfoWithInternalUser: jest.fn().mockResolvedValue({}),
      });

      const request = { params: { tenantIndex: 'kibana_3568561_trex' } };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
        docLinksService
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
      const docLinksService = setupDocLinksServiceMock();
      const tenantIndex = 'kibana_3568561_trex';
      const request = { params: { tenantIndex } };

      await migrateTenants({
        searchGuardBackend,
        KibanaMigrator,
        migratorDeps,
        docLinksService
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
      const docLinksService = setupDocLinksServiceMock();
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
        docLinksService
      })(null, request, response);

      expect(response.internalError).toHaveBeenCalledWith({ body: error });
    });
  });

  test('can migrate saved objects for a tenant', async () => {
    const request = {
      params: { tenantIndex: '.kibana_3655250_wolf' },
    };
    const expectedTenantInfoResponse = { '.kibana_3655250_wolf': '__private__' };
    const expectedMigrationResponse = [
      {
        status: 'patched',
        destIndex: '.kibana_3655250_wolf_7.12.0_001',
        elapsedMs: 386.70695400238037,
      },
    ];

    const response = setupHttpResponseMock();

    const prepareMigrations = jest.fn();
    const runMigrations = jest.fn().mockResolvedValue(expectedMigrationResponse);
    const KibanaMigrator = setupKibanaMigratorMock({ prepareMigrations, runMigrations });
    const docLinksService = setupDocLinksServiceMock();

    const searchGuardBackend = setupSearchGuardBackendMock({
      getTenantInfoWithInternalUser: jest.fn().mockResolvedValue(expectedTenantInfoResponse),
    });

    await migrateTenants({
      searchGuardBackend,
      KibanaMigrator,
      migratorDeps,
      docLinksService
    })(null, request, response);

    expect(prepareMigrations).toHaveBeenCalled();
    expect(runMigrations).toHaveBeenCalledWith({ rerun: true });
    expect(response.ok).toHaveBeenCalledWith({ body: expectedMigrationResponse });
  });

  test('can migrate saved objects for all tenants', async () => {
    const request = {
      params: { tenantIndex: '_all' },
    };
    const expectedTenantInfoResponse = {
      '.kibana_3655250_wolf': '__private__',
      '.kibana_4766361_rabbit': '__private__',
    };
    const expectedMigrationResponse1 = [
      {
        status: 'patched',
        destIndex: '.kibana_3655250_wolf_7.12.0_001',
        elapsedMs: 386.70695400238037,
      },
    ];
    const expectedMigrationResponse2 = [
      {
        status: 'patched',
        destIndex: '.kibana_4766361_rabbit_7.12.0_001',
        elapsedMs: 386.70695400238037,
      },
    ];

    const response = setupHttpResponseMock();

    const docLinksService = setupDocLinksServiceMock();
    const prepareMigrations = jest.fn();
    const runMigrations = jest
      .fn()
      .mockResolvedValueOnce(expectedMigrationResponse1)
      .mockResolvedValueOnce(expectedMigrationResponse2);
    const KibanaMigrator = setupKibanaMigratorMock({ prepareMigrations, runMigrations });

    const searchGuardBackend = setupSearchGuardBackendMock({
      getTenantInfoWithInternalUser: jest.fn().mockResolvedValue(expectedTenantInfoResponse),
    });

    await migrateTenants({
      searchGuardBackend,
      KibanaMigrator,
      migratorDeps,
      docLinksService
    })(null, request, response);

    expect(prepareMigrations).toHaveBeenCalled();
    expect(runMigrations).toHaveBeenCalledWith({ rerun: true });
    expect(response.ok).toHaveBeenCalledWith({
      body: [expectedMigrationResponse1, expectedMigrationResponse2],
    });
  });
});
