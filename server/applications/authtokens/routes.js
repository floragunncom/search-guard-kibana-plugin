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
import { fetchAllFromScroll, wrapForCustomError } from '../../utils';
import { API_ROOT } from '../../utils/constants';

export function getAuthTokens({ clusterClient, fetchAllFromScroll, logger }) {
  return async function (context, request, response) {
    try {
      const {
        body: { scroll, ...bodyProps },
      } = request;
      let allHits = [];

      if (scroll) {
        const firstScrollResponse = await clusterClient
          .asScoped(request)
          .asCurrentUser.transport.request({
            method: 'post',
            path: `/_searchguard/authtoken/_search?scroll=${scroll}`,
            body: bodyProps,
          });

        allHits = await fetchAllFromScroll({
          clusterClient,
          scroll,
          request,
          response: firstScrollResponse,
        });
      } else {
        const body = await clusterClient.asScoped(request).asCurrentUser.transport.request({
          method: 'post',
          path: '/_searchguard/authtoken/_search',
          body: bodyProps,
        });
        allHits = body.hits.hits;
      }

      return response.ok({
        body: allHits.map(({ _source, _id }) => ({ ..._source, _id })),
      });
    } catch (err) {
      logger.error(`getAuthTokens: ${err.stack}`);
      return response.customError(wrapForCustomError(err));
    }
  };
}

export function deleteAuthToken({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        params: { id },
      } = request;

      const body = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'delete',
        path: `/_searchguard/authtoken/${id}`,
      });

      return response.ok({ body });
    } catch (err) {
      logger.error(`deleteAuthToken: ${err.stack}`);
      return response.customError(wrapForCustomError(err));
    }
  };
}

export function getAuthToken({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        params: { id },
      } = request;

      const body = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/_searchguard/authtoken/${id}`,
      });

      return response.ok({ body });
    } catch (err) {
      logger.error(`getAuthToken: ${err.stack}`);
      return response.customError(wrapForCustomError(err));
    }
  };
}

export function saveAuthToken({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const { body: authToken } = request;

      const body = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'post',
        path: '/_searchguard/authtoken',
        body: authToken,
      });

      return response.ok({ body });
    } catch (err) {
      logger.error(`saveAuthToken: ${err.stack}`);
      return response.customError(wrapForCustomError(err));
    }
  };
}

export function getAuthTokenServiceInfo({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const body = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path: `/_searchguard/authtoken/_info`,
      });

      return response.ok({ body });
    } catch (err) {
      logger.error(`getAuthTokenServiceInfo: ${err.stack}`);
      return response.customError(wrapForCustomError(err));
    }
  };
}

export function registerRoutes({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${API_ROOT}/searchguard_authtokens/authtoken/_search`,
      validate: {
        body: schema.object(
          {
            scroll: schema.maybe(schema.string()),
            query: schema.maybe(schema.object({}, { unknowns: 'allow' })),
          },
          { unknowns: 'allow' }
        ),
      },
      options: {
        authRequired: true,
      },
    },
    getAuthTokens({ clusterClient, fetchAllFromScroll, logger })
  );

  router.delete(
    {
      path: `${API_ROOT}/searchguard_authtokens/authtoken/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    deleteAuthToken({ clusterClient, logger })
  );

  router.get(
    {
      path: `${API_ROOT}/searchguard_authtokens/authtoken/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    getAuthToken({ clusterClient, logger })
  );

  router.post(
    {
      path: `${API_ROOT}/searchguard_authtokens/authtoken`,
      validate: {
        body: schema.object({}, { unknowns: 'allow' }),
      },
      options: {
        authRequired: true,
      },
    },
    saveAuthToken({ clusterClient, logger })
  );

  router.get(
    {
      path: `${API_ROOT}/searchguard_authtokens/authtoken/_info`,
      validate: false,
      options: {
        authRequired: true,
      },
    },
    getAuthTokenServiceInfo({ clusterClient, logger })
  );
}
