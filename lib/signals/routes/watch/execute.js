import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const executeWatch = (server, callWithRequestFactory) => async request => {
  try {
    const {
      payload: watch,
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request);
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

export default function executeWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/_execute`,
    method: 'POST',
    handler: executeWatch(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT),
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
