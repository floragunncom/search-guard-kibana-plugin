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

export function defineCommonRoutes({ authcDomain, kibanaCore, logger }) {
  const router = kibanaCore.http.createRouter();

  router.post(
    {
      path: `/api/v2/_searchguard/auth/login`,
      validate: {
        body: schema.object({
          authMeta: schema.object(),
        }),
      },
      options: {
        authRequired: false,
      },
    },
    loginAuthHandler({ logger, authcDomain })
  );
}

export function loginAuthHandler({ logger, authcDomain }) {
  return async function (context, request, response) {
    try {
      const authcState = await authcDomain.login(request, request.body.authMeta);

      if (authcState.isOk) {
        return response.ok({
          headers: authcState.headers,
          body: authcState.body,
        });
      } else if (authcState.isRedirected) {
        return response.redirected({
          headers: authcState.headers,
          body: authcState.body,
        });
      } else {
        return response.unauthorized({
          headers: authcState.headers,
          body: authcState.body,
        });
      }
    } catch (error) {
      logger.error(`Login failed, ${error}`);
      return response.internalError();
    }
  };
}
