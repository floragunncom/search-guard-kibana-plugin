import Joi from 'joi';
import { serverError } from '../../lib/errors';
import {
  ROUTE_PATH,
  ES_SCROLL_SETTINGS,
} from '../../../../utils/signals/constants';

const getWatches = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    const { scroll } = request.query;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('sgSignals.getWatches', { scroll });
    const hits = await fetchAllFromScroll(resp, callWithRequest);

    return {
      ok: true,
      resp: hits.map(h => ({ ...h._source, _id: h._id }))
    };
  } catch (err) {
    console.error('Signals - getWatches:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getWatchesRoute(server, callWithRequestFactory, fetchAllFromScroll) {
  return {
    path: ROUTE_PATH.WATCHES,
    method: 'GET',
    handler: getWatches(server, callWithRequestFactory, fetchAllFromScroll),
    config: {
      validate: {
        query: {
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE)
        }
      }
    }
  };
}
