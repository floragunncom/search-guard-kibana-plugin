import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const deleteWatch = (server, callWithRequestFactory) => async request => {
  try {
    const {
      params: { id },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('sgSignals.deleteWatch', { id, sgtenant });
    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - deleteWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function deleteWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/{id}`,
    method: 'DELETE',
    handler: deleteWatch(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        params: {
          id: Joi.string().required()
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow('')
        }
      }
    }
  };
}
