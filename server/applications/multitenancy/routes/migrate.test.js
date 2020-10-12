/* eslint-disable @kbn/eslint/require-license-header */
import {
  setupLoggerMock,
  httpRouteMock,
  setupKibanaMigratorMock,
  setupSearchGuardBackendInstMock,
} from '../../../utils/mocks';

import { migrateTenants } from './migrate';

const { setupRequestMock, setupResponseMock } = httpRouteMock;

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

const kibanaVersion = '8.0.0';

describe('multitenancy/routes/migrate', () => {
  let mockSearchGuardBackend;
  let mockHandlerRequest;
  let mockHandlerResponse;
  let mockKibanaMigrator;
  let mockMigratorDeps;

  describe('there is an error', () => {
    let mockHandlerResponse;

    beforeEach(() => {
      mockSearchGuardBackend = setupSearchGuardBackendInstMock();
      mockHandlerRequest = setupRequestMock();
      mockHandlerResponse = setupResponseMock();

      mockKibanaMigrator = setupKibanaMigratorMock();
      mockMigratorDeps = {
        client: setupMigrationEsClientMock(),
        kibanaConfig: setupKibanaConfigMock(),
        typeRegistry: setupTypeRegistryMock(),
        logger: setupLoggerMock(),
        savedObjectsConfig: setupSavedObjectsConfigMock(),
        savedObjectValidations: setupSavedObjectValidationsMock(),
        kibanaVersion,
      };
    });

    it('throw error if no tenant index provided', async () => {
      const result = await migrateTenants({
        searchGuardBackend: mockSearchGuardBackend,
        KibanaMigrator: mockKibanaMigrator,
        migratorDeps: mockMigratorDeps,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(result).toEqual({
        options: {
          body: new Error('Tenant index name is required as the request parameter.'),
        },
        payload: new Error('Tenant index name is required as the request parameter.'),
        status: 400,
      });
    });

    it('throw error if no tenant indices found', async () => {
      mockHandlerRequest.params.tenantIndex = '.kibana_3568561_trex';
      mockSearchGuardBackend.getTenantInfoWithInternalUser.mockResolvedValue({});

      const result = await migrateTenants({
        searchGuardBackend: mockSearchGuardBackend,
        KibanaMigrator: mockKibanaMigrator,
        migratorDeps: mockMigratorDeps,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(result).toEqual({
        options: {
          body: new Error('No tenant indices have been found. Migration is not triggered.'),
        },
        payload: new Error('No tenant indices have been found. Migration is not triggered.'),
        status: 503,
      });
    });

    it('throw error if the provided tenant index is not found', async () => {
      const tenantIndex = '.kibana_3568561_trex';
      mockHandlerRequest.params.tenantIndex = tenantIndex;
      mockSearchGuardBackend.getTenantInfoWithInternalUser.mockResolvedValue({
        '.kibana_-152937574_admintenant': 'admin_tenant',
      });

      const result = await migrateTenants({
        searchGuardBackend: mockSearchGuardBackend,
        KibanaMigrator: mockKibanaMigrator,
        migratorDeps: mockMigratorDeps,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(result).toEqual({
        options: {
          body: new Error(
            `The tenant's index "${tenantIndex}" has not been found. Check if the index name is correct.`
          ),
        },
        payload: new Error(
          `The tenant's index "${tenantIndex}" has not been found. Check if the index name is correct.`
        ),
        status: 503,
      });
    });

    it('throw error if a runtime error', async () => {
      const tenantIndex = '.kibana_3568561_trex';
      mockHandlerRequest.params.tenantIndex = tenantIndex;
      mockSearchGuardBackend.getTenantInfoWithInternalUser.mockRejectedValue(
        new Error('nasty error')
      );

      const result = await migrateTenants({
        searchGuardBackend: mockSearchGuardBackend,
        KibanaMigrator: mockKibanaMigrator,
        migratorDeps: mockMigratorDeps,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(mockMigratorDeps.logger.error.mock.calls.length).toBe(1);
      expect(result).toEqual({
        options: {
          body: new Error('nasty error'),
        },
        payload: new Error('nasty error'),
        status: 500,
      });
    });
  });

  describe('there are some results', () => {
    let migrationResult;

    beforeEach(() => {
      // Kibana returns "skipped" status if migration is not needed.
      // For example, if the hash of the new doc is equal to the old doc's hash.
      migrationResult = [{ status: 'skipped' }];
      mockHandlerRequest = setupRequestMock();
      mockHandlerResponse = setupResponseMock();
      mockSearchGuardBackend.getTenantInfoWithInternalUser.mockResolvedValue({
        '.kibana_-152937574_admintenant': 'admin_tenant',
        '.kibana_3568561_trex': 'trex',
      });
      mockMigratorDeps = {
        client: setupMigrationEsClientMock(),
        kibanaConfig: setupKibanaConfigMock(),
        typeRegistry: setupTypeRegistryMock(),
        logger: setupLoggerMock(),
        savedObjectsConfig: setupSavedObjectsConfigMock(),
        savedObjectValidations: setupSavedObjectValidationsMock(),
        kibanaVersion,
      };
      mockKibanaMigrator = setupKibanaMigratorMock({
        mockRunMigrations: jest.fn().mockResolvedValue(migrationResult),
      });
    });

    it("can migrate saved objects for one tenant's index", async () => {
      mockHandlerRequest.params.tenantIndex = '.kibana_3568561_trex';

      const result = await migrateTenants({
        searchGuardBackend: mockSearchGuardBackend,
        KibanaMigrator: mockKibanaMigrator,
        migratorDeps: mockMigratorDeps,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(result).toEqual({
        status: 200,
        payload: [
          {
            status: 'skipped',
          },
        ],
        options: {
          body: [
            {
              status: 'skipped',
            },
          ],
        },
      });
    });

    it('can migrate saved objects for all tenants indices', async () => {
      mockHandlerRequest.params.tenantIndex = '_all';

      const result = await migrateTenants({
        searchGuardBackend: mockSearchGuardBackend,
        KibanaMigrator: mockKibanaMigrator,
        migratorDeps: mockMigratorDeps,
      })(null, mockHandlerRequest, mockHandlerResponse);

      expect(result).toEqual({
        status: 200,
        payload: [
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
        options: {
          body: [
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
        },
      });
    });
  });
});
