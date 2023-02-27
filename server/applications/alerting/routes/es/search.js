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

import { schema } from '@osd/config-schema';
import { serverError } from '../../lib/errors';
import { BASE_URI, MAX_DOC_COUNT_SEARCH } from '../../../../../common/alerting/constants';

export const searchEs = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const { body, index, size } = request.body;

    const { body: resp } = await clusterClient.asScoped(request).asCurrentUser.search({
      index,
      size,
      body,
    });

    return response.ok({ body: { ok: true, resp } });
  } catch (err) {
    logger.error(`searchEs: ${err.stack}`);
    return response.customError(serverError(err));
  }
};

export function searchEsRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${BASE_URI}/_search`,
      validate: {
        body: schema.object(
          {
            body: schema.object({}, { unknowns: 'allow' }),
            index: schema.oneOf([schema.string(), schema.arrayOf(schema.string())]),
            size: schema.number({ defaultValue: MAX_DOC_COUNT_SEARCH }),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    searchEs({ clusterClient, logger })
  );
}