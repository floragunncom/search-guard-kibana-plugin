import Joi from 'joi';
import { serverError } from '../../lib/errors';
import {
  INDEX,
  ROUTE_PATH,
  DEFAULT_DATEFIELD,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT
} from '../../../../utils/signals/constants';

export const getAlertsByQuery = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    const { payload: options, headers: { sgtenant } } = request;

    // We don't filter alerts by tenant if it is Global tenant (value is '')
    if (sgtenant) {
      if (!options.body.query.bool.must) {
        options.body.query.bool.must = [];
      }

      options.body.query.bool.must.push({
        term: {
          'tenant.keyword': {
            value: sgtenant
          }
        }
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

export const getAlertsByQueryRoute = (server, callWithRequestFactory, fetchAllFromScroll) => {
  return {
    path: ROUTE_PATH.ALERTS,
    method: 'POST',
    handler: getAlertsByQuery(server, callWithRequestFactory, fetchAllFromScroll),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow('')
        },
        payload: {
          index: Joi.string().default(INDEX.ALERTS),
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE),
          body: Joi.object({
            size: Joi.number(),
            sort: Joi.array().items(Joi.object({
              [DEFAULT_DATEFIELD]: Joi.string().valid('desc', 'asc')
            })),
            query: Joi.object({
              bool: Joi.object()
            })
          })
        }
      }
    }
  };
}
