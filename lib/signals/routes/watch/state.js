import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

// TODO: add test
const stateOfWatch = (server, callWithRequestFactory) => async request => {
  try {
    const {
      params: { id },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('sgSignals.stateOfWatch', { id, sgtenant });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - stateOfWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function stateOfWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/{id}/_state`,
    method: 'GET',
    handler: stateOfWatch(server, callWithRequestFactory),
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
        }
      }
    }
  };
}
