/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function executeWatchRoute({ router, clusterClient }) {
  router.post(
    {
      path: `${ROUTE_PATH.WATCH}/_execute`,
      validate: {
        body: schema.object({
          watch: schema.object(
            {
              checks: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
              actions: schema.arrayOf(schema.object({}, { unknowns: 'allow' })),
              trigger: schema.object({}, { unknowns: 'allow' }),
              _meta: schema.object({}, { unknowns: 'allow' }),
            },
            { unknowns: 'allow' }
          ),
          simulate: schema.boolean({ defaultValue: false }),
          skipActions: schema.boolean({ defaultValue: true }),
        }),
      },
    },
    async function(context, request, response) {
      try {
        const {
          body: { watch, simulate, skipActions },
          headers: { sgtenant = NO_MULTITENANCY_TENANT },
        } = request;

        const resp = await clusterClient
          .asScoped(request)
          .callAsCurrentUser('sgSignals.executeWatch', {
            body: { watch, simulate, skip_actions: skipActions },
            sgtenant,
          });

        return response.ok({ body: { ok: true, resp } });
      } catch (err) {
        console.error('Signals - executeWatch:', err);
        return response.ok({ body: { ok: false, resp: serverError(err) } });
      }
    }
  );
}
