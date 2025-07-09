import {schema} from '@kbn/config-schema';
import {NO_MULTITENANCY_TENANT, ROUTE_PATH} from "../../../../../common/signals/constants";
import {serverError} from "../../lib";

export function summary({clusterClient, logger}) {
  return async function (context, request, response) {
    try {
      const {
        body: {query},
        headers: {sgtenant = NO_MULTITENANCY_TENANT},
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

      // Validate and split up filtering/sorting parameters
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
      const callRequest = {
        method: 'post',
        path,
        body,
      }

      const resp = await clusterClient.asScoped(request).asCurrentUser.transport.request(callRequest);

      return response.ok({body: {ok: true, resp}});
    } catch (err) {
      logger.error(`stateOfWatch: ${err.stack}`);
      return response.customError(serverError(err));
    }
  };
}

export function summaryRoute({router, clusterClient, logger}) {
  router.post(
    {
      path: `${ROUTE_PATH.WATCH}/summary`,
      validate: {
        body: schema.object({
          query: schema.object({}, {unknowns: 'allow'}),
        }),
      },
    },
    summary({clusterClient, logger})
  );
}
