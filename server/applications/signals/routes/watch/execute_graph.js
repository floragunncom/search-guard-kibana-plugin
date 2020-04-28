/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';

export function executeGraphWatch({ clusterClient, logger }) {
  return async function(context, request, response) {
    try {
      const {
        body: {
          request: { indices: index, body },
        },
      } = request;

      const resp = await clusterClient
        .asScoped(request)
        .callAsCurrentUser('search', { body, index });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`executeGraphWatch: ${err.toString()} ${err.stack}`);
      return response.ok({ body: { ok: false, resp: serverError(err) } });
    }
  };
}

export function executeGraphWatchRoute({ router, clusterClient, logger }) {
  router.post(
    {
      path: `${ROUTE_PATH.WATCH}/_execute_graph`,
      validate: {
        body: schema.object({
          request: schema.object(
            {
              indices: schema.arrayOf(schema.string(), { defaultValue: [] }),
              body: schema.object({}, { unknowns: 'allow', defaultValue: {} }),
            },
            {
              defaultValue: {
                indices: [],
                body: {},
              },
            }
          ),
        }),
      },
    },
    executeGraphWatch({ clusterClient, logger })
  );
}
