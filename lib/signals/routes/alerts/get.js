import Joi from 'joi';
import { serverError } from '../../lib/errors';
import {
  INDEX,
  ES_SCROLL_SETTINGS,
  ROUTE_PATH,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT,
  DEFAULT_DATEFIELD
} from '../../../../utils/signals/constants';

const getAlerts = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    const { dateGte, dateLt, dateField, watchId, index, scroll, size } = request.query;

    const options = {
      index,
      scroll,
      body: {
        size,
        sort: [
          { [dateField]: 'desc' }
        ],
        query: {
          bool: {
            must: [
              { range: { [dateField]: { gte: dateGte, lte: dateLt } } }
            ]
          }
        }
      }
    };

    if (watchId) {
      options.body.query.bool.must.push({
        match: { ['watch_id.keyword']: watchId }
      });
    }

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('search', options);
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

export default function getAlertsRoute(server, callWithRequestFactory, fetchAllFromScroll) {
  return {
    path: ROUTE_PATH.ALERTS,
    method: 'GET',
    handler: getAlerts(server, callWithRequestFactory, fetchAllFromScroll),
    config: {
      validate: {
        query: {
          watchId: Joi.string(),
          index: Joi.string().default(INDEX.ALERTS),
          dateGte: Joi.string().default(DEFAULT_DATEFIELD_RANGE_QUERY_GTE),
          dateLt: Joi.string().default(DEFAULT_DATEFIELD_RANGE_QUERY_LT),
          dateField: Joi.string().default(DEFAULT_DATEFIELD),
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE),
          size: Joi.number().default(ES_SCROLL_SETTINGS.PAGE_SIZE)
        }
      }
    }
  };
}
