import Joi from 'joi';
import { serverError } from '../../lib/errors';
import {
  INDEX,
  ES_SCROLL_SETTINGS,
  ROUTE_PATH,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT,
  DEFAULT_DATEFIELD,
  WATCH_ACTION_STATUS,
  WATCH_STATUS
} from '../../../../utils/signals/constants';

export const getQueryOptions = ({
  dateGte,
  dateLt,
  dateField,
  watchId,
  index,
  scroll,
  size,
  statusCodes
}) => {
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

  if (statusCodes) {
    if (typeof statusCodes === 'string') {
      statusCodes = [statusCodes];
    }

    const terms = [];

    for (let i = 0; i < statusCodes.length; i++) {
      const field = Object.values(WATCH_STATUS).includes(statusCodes[i])
        ? 'status.code.keyword'
        : 'actions.status.code.keyword';

      terms.push({
        term: {
          [field]: {
            value: statusCodes[i]
          }
        }
      });
    }

    options.body.query.bool.should = terms;
    options.body.query.bool.minimum_should_match = 1;
  }

  return options;
};

export const getAlerts = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    console.log('getAlerts -- options', JSON.stringify(getQueryOptions(request.query), null, 2));
    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('search', getQueryOptions(request.query));
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

const statusCodesSchema = Joi.string()
  .valid(
    WATCH_STATUS.EXECUTION_FAILED,
    WATCH_STATUS.NO_ACTION,
    WATCH_ACTION_STATUS.ACTION_FAILED,
    WATCH_ACTION_STATUS.ACTION_THROTTLED,
    WATCH_ACTION_STATUS.ACTION_TRIGGERED
  );

export const getAlertsRoute = (server, callWithRequestFactory, fetchAllFromScroll) => {
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
          size: Joi.number().default(ES_SCROLL_SETTINGS.PAGE_SIZE),
          statusCodes: Joi.alternatives().try(
            statusCodesSchema,
            Joi.array().items(statusCodesSchema)
          )
        }
      }
    }
  };
}
