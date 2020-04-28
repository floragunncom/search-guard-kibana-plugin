/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function stateOfWatch({ clusterClient, logger }) {
  return async function(context, request, response) {
    try {
      const {
        params: { id },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      const resp = await clusterClient
        .asScoped(request)
        .callAsCurrentUser('sgSignals.stateOfWatch', { id, sgtenant });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`stateOfWatch: ${err.toString()} ${err.stack}`);
      return response.ok({ body: { ok: false, resp: serverError(err) } });
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
