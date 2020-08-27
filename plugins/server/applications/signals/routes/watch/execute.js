/* eslint-disable @kbn/eslint/require-license-header */
import { schema } from '@kbn/config-schema';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../../utils/signals/constants';

export function executeWatch({ clusterClient, logger }) {
  return async function(context, request, response) {
    try {
      const {
        body: { watch, simulate, skipActions, showAllRuntimeAttributes },
        headers: { sgtenant = NO_MULTITENANCY_TENANT },
      } = request;

      const resp = await clusterClient
        .asScoped(request)
        .callAsCurrentUser('sgSignals.executeWatch', {
          body: {
            watch,
            simulate,
            skip_actions: skipActions,
            show_all_runtime_attributes: showAllRuntimeAttributes,
          },
          sgtenant,
        });

      return response.ok({ body: { ok: true, resp } });
    } catch (err) {
      logger.error(`executeWatch: ${err.toString()} ${err.stack}`);
      return response.ok({ body: { ok: false, resp: serverError(err) } });
    }
  };
}

export function executeWatchRoute({ router, clusterClient, logger }) {
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
          showAllRuntimeAttributes: schema.boolean({ defaultValue: true }),
        }),
      },
    },
    executeWatch({ clusterClient, logger })
  );
}
