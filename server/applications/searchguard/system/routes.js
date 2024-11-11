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

import { Readable } from 'stream';
import { API_ROOT } from '../../../utils/constants';
import { schema } from '@kbn/config-schema';

export function systemInfoHandler({ searchGuardBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await searchGuardBackend.systeminfo(request.headers);

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

export function licenseHandler({ searchGuardBackend, logger }) {
  return async function (context, request, response) {
    try {
      const body = await searchGuardBackend.uploadLicense(request.headers, request.body);

      return response.ok({ body });
    } catch (error) {
      logger.error(`licenseHandler: ${error.stack}`);
      return response.internalError({ body: error });
    }
  };
}

export function defineSystemRoutes({ searchGuardBackend, logger, kibanaCore }) {
  const router = kibanaCore.http.createRouter();

  router.get(
    {
      path: `${API_ROOT}/systeminfo`,
      validate: false,
      options: {
        authRequired: false,
      },
    },
    systemInfoHandler({ searchGuardBackend, logger })
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
    licenseHandler({ searchGuardBackend, logger })
  );

  router.post(
    {
      path: `${API_ROOT}/templates/auditlog`,
      validate: {
        body: schema.object({
          overwrite: schema.boolean(),
        }),
      },
      options: {
        authRequired: true,
      },
    },
    importTemplateHandler({ searchGuardBackend, logger })
  );
}



export function importTemplateHandler({ searchGuardBackend, logger }) {
  return async function (context, request, response) {
    try {
      const overwrite = (request.body.overwrite === true) ? true : false;
      const sgContext = await context.searchGuard;

      const savedObjectsClient = await sgContext.startContext.savedObjects.getScopedClient(request);
      const savedObjectsImporter = await sgContext.startContext.savedObjects.createImporter(savedObjectsClient);
      // Require the actual objects
      const data = require('./templates/template_auditlog.js');
      let JSONReadStream = Readable.from(data.template_auditlog);
      const importResponse = await savedObjectsImporter.import({
        readStream: JSONReadStream,
        overwrite: overwrite,
        compatibilityMode: true
      });

      return response.ok({
        body: importResponse
      });
    } catch (error) {
      logger.error(`importTemplateHandler: ${error.stack}`);
      return response.internalError({ body: error });
    }
  };
}
