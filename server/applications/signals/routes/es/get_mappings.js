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
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../../common/signals/constants';

export const getMappings = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const { index } = request.body;

    const resp = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('indices.getMapping', { index });

    return response.ok({ body: { ok: true, resp } });
  } catch (err) {
    logger.error(`getMappings: ${err.stack}`);
    return response.ok({ body: { ok: false, resp: serverError(err) } });
  }
};

export function getMappingsRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${BASE_URI}/_mappings`,
      validate: {
        body: schema.object({
          index: schema.oneOf([schema.string(), schema.arrayOf(schema.string())]),
        }),
      },
    },
    getMappings({ clusterClient, logger })
  );
}
