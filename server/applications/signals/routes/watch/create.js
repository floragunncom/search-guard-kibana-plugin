/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function createWatchRoute({ router, clusterClient }) {
  router.put(
    {
      path: `${ROUTE_PATH.WATCH}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.object(
          {
            actions: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
            checks: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
            trigger: schema.object({}, { unknowns: 'allow' }),
            _meta: schema.object({}, { unknowns: 'allow' }), // ES plugin meta
            _ui: schema.object({}, { unknowns: 'allow' }), // UI meta
            active: schema.boolean(),
            log_runtime_data: schema.boolean(),
          },
          { unknowns: 'allow' }
        ),
      },
    },
    async function(context, request, response) {
      try {
        const {
          body,
          params: { id },
          headers: { sgtenant = NO_MULTITENANCY_TENANT },
        } = request;

        const resp = await clusterClient
          .asScoped(request)
          .callAsCurrentUser('sgSignals.saveWatch', {
            id,
            body,
            sgtenant,
          });

        return response.ok({ body: { ok: true, resp } });
      } catch (err) {
        console.error('Signals - createWatch:', err);
        return response.ok({ body: { ok: false, resp: serverError(err) } });
      }
    }
  );
}
