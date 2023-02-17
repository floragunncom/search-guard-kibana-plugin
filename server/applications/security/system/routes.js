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

import { API_ROOT } from '../../../utils/constants';
import { schema } from '@osd/config-schema';

export function systemInfoHandler({ eliatraSuiteBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await eliatraSuiteBackend.systeminfo(request.headers);

      // Avoid Cacheable SSL Page
      // https://floragunn.atlassian.net/browse/ITT-2388
      return response.ok({
        body,
        headers: { 'Cache-Control': 'no-cache, no-store' },
      });
    } catch (error) {
      logger.error(`systemInfoHandler: ${error.stack}`);
      return response.internalError({ body: error });
    }
  };
}

export function licenseHandler({ eliatraSuiteBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await eliatraSuiteBackend.uploadLicense(request.headers, request.body);

      return response.ok({ body });
    } catch (error) {
      logger.error(`licenseHandler: ${error.stack}`);
      return response.internalError({ body: error });
    }
  };
}

export function defineSystemRoutes({ eliatraSuiteBackend, logger, kibanaCore }) {
  const router = kibanaCore.http.createRouter();

  router.get(
    {
      path: `${API_ROOT}/systeminfo`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    systemInfoHandler({ eliatraSuiteBackend, logger })
  );

  router.post(
    {
      path: `${API_ROOT}/license`,
      validate: {
        body: schema.object({
          sg_license: schema.string(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    licenseHandler({ eliatraSuiteBackend, logger })
  );
}
