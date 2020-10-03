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
import { BASE_URI } from '../../../../../utils/signals/constants';

export const getAliases = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const { alias } = request.body;
    const resp = await clusterClient.asScoped(request).callAsCurrentUser('cat.aliases', {
      alias,
      format: 'json',
      h: 'alias,index',
    });

    return response.ok({ body: { ok: true, resp } });
  } catch (err) {
    logger.error(`getAliases: ${err.stack}`);
    return response.ok({ body: { ok: false, resp: serverError(err) } });
  }
};

export function getAliasesRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${BASE_URI}/_aliases`,
      validate: {
        body: schema.object({
          alias: schema.oneOf([schema.string(), schema.arrayOf(schema.string())]),
        }),
      },
    },
    getAliases({ clusterClient, logger })
  );
}
