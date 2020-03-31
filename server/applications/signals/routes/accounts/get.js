/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError, fetchAllFromScroll } from '../../lib';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH, ES_SCROLL_SETTINGS } from '../../../../../utils/signals/constants';

const getAccounts = ({ clusterClient }) => async request => {
  try {
    const {
      payload: { query, scroll },
    } = request;

    const body = {};
    if (query && !!Object.keys(query).length) {
      body.query = query;
    }

    const firstScrollResponse = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('sgSignals.getAccounts', { scroll, body });

    const hits = await fetchAllFromScroll({
      clusterClient,
      scroll,
      request,
      response: firstScrollResponse,
    });

    return {
      ok: true,
      resp: hits.map(({ _source, _id }) => ({ ..._source, _id: getId(_id) }))
    };
  } catch (err) {
    console.error('Signals - getAccounts:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export function getAccountsRoute({ hapiServer, clusterClient }) {
  hapiServer.route({
    path: ROUTE_PATH.ACCOUNTS,
    method: 'POST',
    handler: getAccounts({ clusterClient }),
    config: {
      validate: {
        options: {
          allowUnknown: true,
        },
        payload: {
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE),
          query: Joi.object(),
        },
      },
    },
  });
}
