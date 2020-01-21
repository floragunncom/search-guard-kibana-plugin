import Joi from 'joi';
import { serverError } from '../../lib/errors';
import {
  INDEX,
  ROUTE_PATH,
  DEFAULT_DATEFIELD,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../utils/signals/constants';

export const getAlerts = (
  server,
  callWithRequestFactory,
  fetchAllFromScroll,
  clusterName,
  plugins
) => async request => {
  try {
    const {
      payload: { query, sort, index, scroll },
      headers: { sgtenant },
    } = request;

    const options = { index, scroll };

    if (query && !!Object.keys(query).length) {
      // We don't filter alerts by tenant if it is Global tenant (value is '')
      if (sgtenant) {
        if (!query.bool.must) {
          query.bool.must = [];
        }

        query.bool.must.push({
          term: {
            'tenant.keyword': { value: sgtenant },
          },
        });
      }

      options.body = { sort, query };
    }

    const callWithRequest = callWithRequestFactory(server, request, clusterName, plugins);
    const resp = await callWithRequest('search', options);
    const hits = await fetchAllFromScroll(resp, callWithRequest);

    return {
      ok: true,
      resp: hits.map(h => ({ ...h._source, _id: h._id, _index: h._index })),
    };
  } catch (err) {
    console.error('Signals - getAlerts:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export const getAlertsRoute = (
  server,
  callWithRequestFactory,
  fetchAllFromScroll,
  clusterName,
  plugins
) => {
  return {
    path: ROUTE_PATH.ALERTS,
    method: 'POST',
    handler: getAlerts(server, callWithRequestFactory, fetchAllFromScroll, clusterName, plugins),
    config: {
      validate: {
        options: {
          allowUnknown: true,
        },
        headers: {
          sgtenant: Joi.string()
            .default(NO_MULTITENANCY_TENANT)
            .allow(''),
        },
        payload: {
          index: Joi.string().default(INDEX.ALERTS),
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE),
          query: Joi.object(),
          sort: Joi.array()
            .items(
              Joi.object({
                [DEFAULT_DATEFIELD]: Joi.string().valid('desc', 'asc'),
              })
            )
            .default([{ [DEFAULT_DATEFIELD]: 'desc' }]),
        },
      },
    },
  };
};