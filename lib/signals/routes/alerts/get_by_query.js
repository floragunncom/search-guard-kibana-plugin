import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

export const getAlertsByQuery = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    const { query } = request.payload;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('search', query);
    const hits = await fetchAllFromScroll(resp, callWithRequest);

    return {
      ok: true,
      resp: hits.map(h => ({ ...h._source, _id: h._id, _index: h._index }))
    };
  } catch (err) {
    console.error('Signals - getAlerts:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export const getAlertsByQueryRoute = (server, callWithRequestFactory, fetchAllFromScroll) => {
  return {
    path: ROUTE_PATH.ALERTS,
    method: 'POST',
    handler: getAlertsByQuery(server, callWithRequestFactory, fetchAllFromScroll),
    config: {
      validate: {
        payload: {
          query: Joi.object()
        }
      }
    }
  };
}
