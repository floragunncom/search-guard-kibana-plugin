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
import { ROUTE_PATH } from '../../../../../utils/signals/constants';

export const createAccount = ({ clusterClient, logger }) => async (context, request, response) => {
  try {
    const {
      body,
      params: { id, type },
    } = request;

    const resp = await clusterClient.asScoped(request).callAsCurrentUser('sgSignals.saveAccount', {
      id,
      type,
      body,
    });

    return response.ok({ body: { ok: true, resp } });
  } catch (err) {
    logger.error(`createAccount: ${err.stack}`);
    return response.ok({ body: { ok: false, resp: serverError(err) } });
  }
};

export function createAccountRoute({ router, clusterClient, logger }) {
  router.put(
    {
      path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
      validate: {
        params: schema.object(
          {
            id: schema.string(),
            type: schema.string(),
          },
          { unknowns: 'allow' }
        ),
        body: schema.object(
          {
            type: schema.string(),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    createAccount({ clusterClient, logger })
  );
}
