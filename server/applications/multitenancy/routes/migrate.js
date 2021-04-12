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

import { schema } from '@kbn/config-schema';
import { API_ROOT } from '../../../utils/constants';

export function migrateTenants({
  searchGuardBackend,
  KibanaMigrator,
  migratorDeps: {
    client,
    kibanaConfig,
    typeRegistry,
    logger,
    kibanaVersion,
    savedObjectsConfig,
    savedObjectValidations,
  },
}) {
  return async function (context, request, response) {
    try {
      const { tenantIndex } = request.params;
      let body;

      if (!tenantIndex) {
        return response.badRequest({
          body: new Error('Tenant index name is required as the request parameter.'),
        });
      }

      let tenantIndices = await searchGuardBackend.getTenantInfoWithInternalUser();
      tenantIndices =
        !tenantIndices || typeof tenantIndices !== 'object' ? [] : Object.keys(tenantIndices);

      if (!tenantIndices.length) {
        return response.customError({
          statusCode: 503,
          body: new Error('No tenant indices have been found. Migration is not triggered.'),
        });
      }

      if (tenantIndex === '_all') {
        body = await Promise.all(
          tenantIndices.map((index) => {
            const kibanaMigrator = new KibanaMigrator({
              client,
              kibanaConfig: { ...kibanaConfig, index },
              typeRegistry,
              logger,
              kibanaVersion,
              savedObjectsConfig,
              savedObjectValidations,
            });

            kibanaMigrator.prepareMigrations();
            return kibanaMigrator.runMigrations({ rerun: true });
          })
        );

        return response.ok({ body });
      }

      const indexToMigrate = tenantIndices.find((index) => index === tenantIndex);

      if (!indexToMigrate) {
        return response.customError({
          statusCode: 503,
          body: new Error(
            `The tenant's index "${tenantIndex}" has not been found. Check if the index name is correct.`
          ),
        });
      }

      const kibanaMigrator = new KibanaMigrator({
        client,
        kibanaConfig: { ...kibanaConfig, index: indexToMigrate },
        typeRegistry,
        logger,
        kibanaVersion,
        savedObjectsConfig,
        savedObjectValidations,
      });

      kibanaMigrator.prepareMigrations();
      body = await kibanaMigrator.runMigrations({ rerun: true });

      return response.ok({ body });
    } catch (error) {
      logger.error(`migrateRoute - ${error}: ${error.stack}`);
      return response.internalError({ body: error });
    }
  };
}

export function migrateTenantsRoute({
  kibanaRouter,
  searchGuardBackend,
  migratorDeps,
  KibanaMigrator,
}) {
  const options = {
    path: `${API_ROOT}/multitenancy/migrate/{tenantIndex}`,
    validate: {
      params: schema.object({
        tenantIndex: schema.string(),
      }),
    },
  };

  kibanaRouter.post(options, migrateTenants({ searchGuardBackend, migratorDeps, KibanaMigrator }));
  kibanaRouter.get(options, migrateTenants({ searchGuardBackend, migratorDeps, KibanaMigrator }));
}
