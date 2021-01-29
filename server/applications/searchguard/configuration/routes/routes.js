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

import { schema } from '@kbn/config-schema';
import { wrapForCustomError } from '../../../../utils/wrap_elasticsearch_error';
import { API_ROOT } from '../../../../utils/constants';

export function getConfigResourcesByType({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const results = await searchGuardConfigurationBackend.list(
        request.headers,
        request.params.resourceName
      );

      return response.ok({
        body: {
          total: Object.keys(results).length,
          data: results,
        },
      });
    } catch (error) {
      logger.error(`getConfigResourcesByType: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function getConfigResourceById({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await searchGuardConfigurationBackend.get(
        request.headers,
        request.params.resourceName,
        request.params.id
      );

      return response.ok({ body });
    } catch (error) {
      logger.error(`getConfigResourceById: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function deleteConfigResource({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const result = await searchGuardConfigurationBackend.delete(
        request.headers,
        request.params.resourceName,
        request.params.id
      );

      return response.ok({ body: { message: result.message } });
    } catch (error) {
      logger.error(`deleteConfigResource: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function updateConfigResource({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const result = await searchGuardConfigurationBackend.save(
        request.headers,
        request.params.resourceName,
        request.params.id,
        request.body
      );

      return response.ok({ body: { message: result.message } });
    } catch (error) {
      logger.error(`updateConfigResource: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function deleteConfigCache({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const result = await searchGuardConfigurationBackend.clearCache(request.headers);

      return response.ok({ body: { message: result.message } });
    } catch (error) {
      logger.error(`deleteConfigCache: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function getRestApiInfo({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await searchGuardConfigurationBackend.restapiinfo(request.headers);

      return response.ok({ body });
    } catch (error) {
      logger.error(`getRestApiInfo: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function getConfigIndices({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const {
        headers,
        body: { index },
      } = request;

      const body = await searchGuardConfigurationBackend.indices({ headers, index });

      return response.ok({ body });
    } catch (error) {
      logger.error(`getConfigIndices: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function getConfigAliases({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const {
        headers,
        body: { alias },
      } = request;

      const body = await searchGuardConfigurationBackend.aliases({ headers, alias });

      return response.ok({ body });
    } catch (error) {
      logger.error(`getConfigAliases: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function getConfigIndexMappings({ searchGuardConfigurationBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await searchGuardConfigurationBackend.getIndexMappings({
        headers: request.headers,
        body: request.body,
      });

      return response.ok({ body });
    } catch (error) {
      logger.error(`getConfigIndexMappings: ${error.stack}`);
      return response.customError(wrapForCustomError(error));
    }
  };
}

/**
 * The backend API allows to manage the backend configuration.
 */
export function defineConfigurationRoutes({ searchGuardConfigurationBackend, kibanaCore, logger }) {
  const router = kibanaCore.http.createRouter();

  /**
   * Returns a list of resource instances.
   *
   */
  router.get(
    {
      path: `${API_ROOT}/configuration/{resourceName}`,
      validate: {
        params: schema.object({
          resourceName: schema.string(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    getConfigResourcesByType({ searchGuardConfigurationBackend, logger })
  );

  /**
   * Returns a resource instance.
   *
   * Response sample:
   *
   * {
   *   "id": "kibiuser",
   * }
   */
  router.get(
    {
      path: `${API_ROOT}/configuration/{resourceName}/{id}`,
      validate: {
        params: schema.object({
          resourceName: schema.string(),
          id: schema.string(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    getConfigResourceById({ searchGuardConfigurationBackend, logger })
  );

  /**
   * Deletes a resource instance.
   *
   * Response sample:
   *
   * {
   *   "message": "Deleted user username"
   * }
   */
  router.delete(
    {
      path: `${API_ROOT}/configuration/{resourceName}/{id}`,
      validate: {
        params: schema.object({
          resourceName: schema.string(),
          id: schema.string(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    deleteConfigResource({ searchGuardConfigurationBackend, logger })
  );

  /**
   * Updates or creates a resource
   *
   * Request sample:
   *
   * {
   *   "password": "password"
   * }
   */
  router.post(
    {
      path: `${API_ROOT}/configuration/{resourceName}/{id}`,
      validate: {
        params: schema.object({
          resourceName: schema.string(),
          id: schema.string(),
        }),
        body: schema.object({}, { unknowns: 'allow' }),
      },
      options: {
        authRequired: true,
      },
    },
    updateConfigResource({ searchGuardConfigurationBackend, logger })
  );

  router.delete(
    {
      path: `${API_ROOT}/configuration/cache`,
      validate: false,
      options: {
        authRequired: true,
      },
    },
    deleteConfigCache({ searchGuardConfigurationBackend, logger })
  );

  router.get(
    {
      path: `${API_ROOT}/restapiinfo`,
      validate: false,
      options: {
        authRequired: true,
      },
    },
    getRestApiInfo({ searchGuardConfigurationBackend, logger })
  );

  router.post(
    {
      path: `${API_ROOT}/configuration/indices`,
      validate: {
        body: schema.object({
          index: schema.oneOf([schema.string(), schema.arrayOf(schema.string())]),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    getConfigIndices({ searchGuardConfigurationBackend, logger })
  );

  router.post(
    {
      path: `${API_ROOT}/configuration/aliases`,
      validate: {
        body: schema.object({
          alias: schema.oneOf([schema.string(), schema.arrayOf(schema.string())]),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    getConfigAliases({ searchGuardConfigurationBackend, logger })
  );

  router.post(
    {
      path: `${API_ROOT}/configuration/index_mappings`,
      validate: {
        body: schema.object({
          index: schema.arrayOf(schema.string()),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    getConfigIndexMappings({ searchGuardConfigurationBackend, logger })
  );
}
