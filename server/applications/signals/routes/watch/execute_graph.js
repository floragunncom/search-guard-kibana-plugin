/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';

export function executeGraphWatchRoute({ router, clusterClient }) {
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
    async function(context, req, response) {
      try {
        const {
          body: {
            request: { indices: index, body },
          },
        } = req;

        const resp = await clusterClient.asScoped(req).callAsCurrentUser('search', { body, index });

        return response.ok({ body: { ok: true, resp } });
      } catch (err) {
        console.error('Signals - executeGraphWatch:', err);
        return response.ok({ body: { ok: false, resp: serverError(err) } });
      }
    }
  );
}
