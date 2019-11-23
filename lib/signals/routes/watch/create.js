import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const createWatch = (server, callWithRequestFactory) => async request => {
  try {
    const {
      payload: body,
      params: { id },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('sgSignals.saveWatch', { id, body, sgtenant });
    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - createWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function createWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/{id}`,
    method: 'PUT',
    handler: createWatch(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow('')
        },
        params: {
          id: Joi.string().required()
        },
        payload: {
          actions: Joi.array().required(),
          checks: Joi.array().required(),
          trigger: Joi.object().required(),
          _meta: Joi.object(), // ES plugin meta
          _ui: Joi.object(), // UI meta
          active: Joi.boolean(),
          log_runtime_data: Joi.boolean()
        }
      }
    }
  };
}
