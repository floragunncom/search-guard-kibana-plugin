/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function getWatch({ clusterClient, logger }) {
  return async function(context, request, response) {
    try {
      const {
        params: { id },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      const { _source, _id } = await clusterClient
        .asScoped(request)
        .callAsCurrentUser('sgSignals.getWatch', { id, sgtenant });

      return response.ok({ body: { ok: true, resp: { ..._source, _id: getId(_id) } } });
    } catch (err) {
      if (err.statusCode !== 404) {
        logger.error(`getWatch: ${err.toString()} ${err.stack}`);
      }
      return response.ok({ body: { ok: false, resp: serverError(err) } });
    }
  };
}

export function getWatchRoute({ router, clusterClient, logger }) {
  router.get(
    {
      path: `${ROUTE_PATH.WATCH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    getWatch({ clusterClient, logger })
  );
}
