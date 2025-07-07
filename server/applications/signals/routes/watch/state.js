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
import {ROUTE_PATH, NO_MULTITENANCY_TENANT, ES_SCROLL_SETTINGS} from '../../../../../common/signals/constants';
import {fetchAllFromScroll} from "../../../../utils";

export function stateOfWatch({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        params: { id },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      const path = `/_signals/watch/${encodeURIComponent(sgtenant)}/${encodeURIComponent(id)}/_state`;
      const resp = await clusterClient.asScoped(request).asCurrentUser.transport.request({
        method: 'get',
        path,
      });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`stateOfWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function stateOfWatchRoute({ router, clusterClient, logger }) {
  router.get(
    {
      path: `${ROUTE_PATH.WATCH}/{id}/_state`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    stateOfWatch({ clusterClient, logger })
  );
}

export function summary({ clusterClient, logger }) {
  return async function (context, request, response) {
    try {
      const {
        body: { query },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      /**
       * Filters passed as part of the request body
       *
       * @type {Object}
       */
      let body = {};

      /**
       * Filters passed as url search params
       * Not using URLSearchParams because its toString method encodes + to %2B.
       *
       * @type {Object}
       */
      let searchParams = {
        //sorting: "-severity_details.level_numeric"
      };

      /*
        body: {
          sorting: "-severity_details.level_numeric"
          //"watch_id": ["avg_ticket_*"],
          //"watch_status_codes": ["ACTION_EXECUTED", "ACTION_FAILED", "EXECUTION_FAILED"],
          //"severities": ["HIGH", "CRITICAL"],
        },
         */
      if (query && typeof query === 'object' && !!Object.keys(query).length) {
        const allowedBodyParams = ['watch_id', 'size']; // 'severities'
        const allowedSearchParams = ['sorting'];
        Object.keys(query).forEach(key => {
          const property = key.toLowerCase();
          if (allowedBodyParams.includes(property)) {
            body[property] = query[property];
          } else if (allowedSearchParams.includes(property)) {
            searchParams[property] = query[property];
          }
        })
      }

      let searchParamsString = '';
      if (Object.keys(searchParams).length > 0) {
        searchParamsString = `?`;
        Object.keys(searchParams).forEach(key => {
          searchParamsString += `${key}=${searchParams[key]}&`;
        });
        searchParamsString = searchParamsString.slice(0, -1);
      }

      const path = `/_signals/watch/${encodeURIComponent(sgtenant)}/summary${searchParamsString}`;
      console.log('So what path am I calling now then?', path, searchParamsString, searchParams, 'size', searchParams.size)


      console.log('So what body am I calling?', body, searchParamsString)
      const callRequest = {
        method: 'post',
        path,
        body,
      }

      const resp = await clusterClient.asScoped(request).asCurrentUser.transport.request(callRequest);

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`stateOfWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

// TODO TENANT BODY
// TODO MOVE THIS TO ANOTHER FILE FOR CONSISTENCY
export function summaryRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${ROUTE_PATH.WATCH}/summary`,
      validate: {
        body: schema.object({
          query: schema.object({}, { unknowns: 'allow' }),
        }),
      },
    },
    summary({ clusterClient, logger })
  );
}

