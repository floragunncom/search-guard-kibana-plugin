import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const deleteWatch = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id } = request.params;
    const resp = await callWithRequest('sgSignals.deleteWatch', { id });
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
        params: {
          id: Joi.string().required()
        }
      }
    }
  };
}
