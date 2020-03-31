/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function getWatchRoute({ router, clusterClient }) {
  router.get(
    {
      path: `${ROUTE_PATH.WATCH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    async function(context, request, response) {
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
          console.error('Signals - getWatch:', err);
        }
        return response.ok({ body: { ok: false, resp: serverError(err) } });
      }
    }
  );
}
