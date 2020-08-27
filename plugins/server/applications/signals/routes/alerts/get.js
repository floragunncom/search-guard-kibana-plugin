/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib';
import {
  INDEX,
  ROUTE_PATH,
  DEFAULT_DATEFIELD,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../../utils/signals/constants';

export const getAlerts = ({ clusterClient, fetchAllFromScroll, logger }) => async request => {
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

    const firstScrollResponse = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('search', options);

    const hits = await fetchAllFromScroll({
      clusterClient,
      scroll,
      request,
      response: firstScrollResponse,
    });

    return {
      ok: true,
      resp: hits.map(h => ({ ...h._source, _id: h._id, _index: h._index })),
    };
  } catch (err) {
    logger.error(`getAlerts: ${err.toString()} ${err.stack}`);
    return { ok: false, resp: serverError(err) };
  }
};

export const getAlertsRoute = ({ hapiServer, clusterClient, fetchAllFromScroll, logger }) => {
  hapiServer.route({
    path: ROUTE_PATH.ALERTS,
    method: 'POST',
    handler: getAlerts({ clusterClient, fetchAllFromScroll, logger }),
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
  });
};
