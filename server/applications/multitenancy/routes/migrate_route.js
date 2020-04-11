/* eslint-disable @kbn/eslint/require-license-header */
import Boom from 'boom';
import { schema } from '@kbn/config-schema';
import { KibanaMigrator } from '../../../../../../src/core/server/saved_objects/migrations';
import { API_ROOT } from '../../../utils/constants';

export function migrateRoute({
  router,
  searchGuardBackend,
  migratorDeps: {
    callCluster,
    kibanaConfig,
    typeRegistry,
    logger,
    kibanaVersion,
    savedObjectsConfig,
    savedObjectValidations,
  },
}) {
  const options = {
    path: `${API_ROOT}/multitenancy/migrate/{tenantIndex}`,
    validate: {
      params: schema.object({
        tenantIndex: schema.string(),
      }),
    },
  };

  async function handler(context, request, response) {
    try {
      const { tenantIndex } = request.params;
      let body;

      let tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      if (!!tenantIndices.length) {
        throw new Error('No tenant indices have been found!');
      }

      if (tenantIndex === '_all') {
        body = await Promise.all(
          tenantIndices.map(index => {
            const migrator = new KibanaMigrator({
              callCluster,
              kibanaConfig: { ...kibanaConfig, index },
              typeRegistry,
              logger,
              kibanaVersion,
              savedObjectsConfig,
              savedObjectValidations,
            });

            return migrator.runMigrations({ rerun: true });
          })
        );

        return response.ok({ body });
      }

      const indexToMigrate = tenantIndices.find(index => index === tenantIndex);

      if (!indexToMigrate) {
        throw new Error(
          `The tenant index "${tenantIndex}" has not been found. Check if the index name is correct.`
        );
      }

      const migrator = new KibanaMigrator({
        callCluster,
        kibanaConfig: { ...kibanaConfig, index: indexToMigrate },
        typeRegistry,
        logger,
        kibanaVersion,
        savedObjectsConfig,
        savedObjectValidations,
      });

      body = await migrator.runMigrations({ rerun: true });

      return response.ok({ body });
    } catch (error) {
      logger.error(`migrateRoute - ${error}: ${error.stack}`);
      return response.customError({
        body: Boom.boomify(error),
        statusCode: 500,
      });
    }
  }

  router.post(options, handler);
  router.get(options, handler);
}
