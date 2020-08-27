/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function ackWatch({ clusterClient, logger }) {
  return async function(context, request, response) {
    try {
      const {
        params: { watchId, actionId },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      let callPath = 'sgSignals.ackWatch';
      let body = { id: watchId, sgtenant };

      if (actionId) {
        callPath = 'sgSignals.ackWatchAction';
        body = { watchId, actionId, sgtenant };
      }

      const resp = await clusterClient.asScoped(request).callAsCurrentUser(callPath, body);

      return response.ok({
        body: {
          ok: true,
          resp,
        },
      });
    } catch (err) {
      logger.error(`ackWatch: ${err.toString()} ${err.stack}`);
      return response.ok({ body: { ok: false, resp: serverError(err) } });
    }
  };
}

export function ackWatchRoute({ router, clusterClient, logger }) {
  router.put(
    {
      path: `${ROUTE_PATH.WATCH}/{watchId}/_ack/{actionId?}`,
      validate: {
        params: schema.object({
          watchId: schema.string(),
          actionId: schema.maybe(schema.string()),
        }),
      },
    },
    ackWatch({ clusterClient, logger })
  );
}
