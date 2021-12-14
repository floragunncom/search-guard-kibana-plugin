/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may//  obtain a copy of the License at
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
import { wrapForCustomError } from '../../../utils/wrap_elasticsearch_error';

export function handleKibanaCapabilities() {
  return function (context, request, response) {
    try {
      const defaultCapabilities = { navLinks: {}, dashboard: {}, observabilityCases: {} };
      for (const appName of request.body.applications) {
        defaultCapabilities[appName] = {};
        defaultCapabilities.navLinks[appName] = true;
      }

      return response.ok({ body: defaultCapabilities });
    } catch (error) {
      return response.customError(wrapForCustomError(error));
    }
  };
}

export function kibanaCapabilitiesRoute({ router }) {
  const options = {
    path: '/api/v1/searchguard/kibana_capabilities',
    options: { authRequired: false },
    validate: {
      body: schema.object({
        applications: schema.arrayOf(schema.string()),
      }),
    },
  };

  router.post(options, handleKibanaCapabilities());
}
