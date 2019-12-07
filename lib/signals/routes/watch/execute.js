import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const executeWatch = (
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) => async request => {
  try {
    const {
      payload: watch,
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(
      server,
      request,
      clusterName,
      plugins
    );

    const { data: resp } = await callWithRequest('sgSignals.executeWatch', {
      body: { watch },
      sgtenant,
    });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - executeWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function executeWatchRoute(
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) {
  return {
    path: `${ROUTE_PATH.WATCH}/_execute`,
    method: 'POST',
    handler: executeWatch(server, callWithRequestFactory, clusterName, plugins),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow(''),
        },
        payload: {
          checks: Joi.array().required(),
          actions: Joi.array().required(),
          trigger: Joi.object().required(),
          _meta: Joi.object().required()
        }
      }
    }
  };
}
