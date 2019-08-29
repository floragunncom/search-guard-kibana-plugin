import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const getWatch = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id } = request.params;
    const { _source, _id } = await callWithRequest('sgSignals.getWatch', { id });
    return { ok: true, resp: { ..._source, _id } };
  } catch (err) {
    console.error('Signals - getWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/{id}`,
    method: 'GET',
    handler: getWatch(server, callWithRequestFactory),
    config: {
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  };
}
