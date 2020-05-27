import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const executeWatch = (server, callWithRequestFactory, clusterName, plugins) => async request => {
  try {
    const {
      payload: { watch, simulate, skipActions, showAllRuntimeAttributes },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request, clusterName, plugins);

    const resp = await callWithRequest('sgSignals.executeWatch', {
      body: {
        watch,
        simulate,
        skip_actions: skipActions,
        show_all_runtime_attributes: showAllRuntimeAttributes,
      },
      sgtenant,
    });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - executeWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function executeWatchRoute(server, callWithRequestFactory, clusterName, plugins) {
  return {
    path: `${ROUTE_PATH.WATCH}/_execute`,
    method: 'POST',
    handler: executeWatch(server, callWithRequestFactory, clusterName, plugins),
    config: {
      validate: {
        options: {
          allowUnknown: true,
        },
        headers: {
          sgtenant: Joi.string()
            .default(NO_MULTITENANCY_TENANT)
            .allow(''),
        },
        payload: {
          watch: Joi.object({
            checks: Joi.array().required(),
            actions: Joi.array().required(),
            trigger: Joi.object().required(),
            _meta: Joi.object().required(),
          }).required(),
          simulate: Joi.boolean().default(false),
          skipActions: Joi.boolean().default(true),
          showAllRuntimeAttributes: Joi.boolean().default(true),
        },
      },
    },
  };
}
