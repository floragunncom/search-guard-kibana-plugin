import Joi from 'joi';
import { serverError } from '../../lib/errors';
import {
  ROUTE_PATH,
  ES_SCROLL_SETTINGS,
  INDEX
} from '../../../../utils/signals/constants';

const getDestinations = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    const { scroll } = request.query;
    const callWithRequest = callWithRequestFactory(server, request);

    const resp = await callWithRequest('sgSignals.getDestinations', { scroll });
    const hits = await fetchAllFromScroll(resp, callWithRequest);
    return {
      ok: true,
      resp: hits.map(h => ({ ...h._source, _id: h._id }))
    };

  } catch (err) {
    console.error('Signals - getDestinations:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getDestinationsRoute(server, callWithRequestFactory, fetchAllFromScroll) {
  return {
    path: ROUTE_PATH.DESTINATIONS,
    method: 'GET',
    handler: getDestinations(server, callWithRequestFactory, fetchAllFromScroll),
    config: {
      validate: {
        query: {
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE)
        }
      }
    }
  };
}
