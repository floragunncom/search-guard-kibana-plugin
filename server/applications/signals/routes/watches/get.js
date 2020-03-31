/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { getId, serverError, fetchAllFromScroll } from '../../lib';
import {
  ROUTE_PATH,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../../utils/signals/constants';

export function getWatchesRoute({ router, clusterClient }) {
  router.post(
    {
      path: ROUTE_PATH.WATCHES,
      validate: {
        body: schema.object({
          scroll: schema.string({ defaultValue: ES_SCROLL_SETTINGS.KEEPALIVE }),
          query: schema.object({}, { unknowns: 'allow' }),
        }),
      },
    },
    async function(context, request, response) {
      try {
        const {
          headers: { sgtenant = NO_MULTITENANCY_TENANT },
          body: { query, scroll },
        } = request;

        const body = {};
        if (query && !!Object.keys(query).length) {
          body.query = query;
        }

        const firstScrollResponse = await clusterClient
          .asScoped(request)
          .callAsCurrentUser('sgSignals.getWatches', {
            scroll,
            sgtenant,
            body,
          });

        const hits = await fetchAllFromScroll({
          clusterClient,
          scroll,
          request,
          response: firstScrollResponse,
        });

        return response.ok({
          body: {
            ok: true,
            resp: hits.map(h => ({ ...h._source, _id: getId(h._id) })),
          },
        });
      } catch (err) {
        console.error('Signals - getWatches:', err);
        return response.ok({ body: { ok: false, resp: serverError(err) } });
      }
    }
  );
}
