import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH, ES_SCROLL_SETTINGS } from '../../../../utils/signals/constants';

const getAccounts = (
  server,
  callWithRequestFactory,
  fetchAllFromScroll,
  clusterName,
  plugins
) => async request => {
  try {
    const {
      payload: { query, scroll },
    } = request;

    const body = {};
    if (query && !!Object.keys(query).length) {
      body.query = query;
    }

    const callWithRequest = callWithRequestFactory(server, request, clusterName, plugins);
    const resp = await callWithRequest('sgSignals.getAccounts', { scroll, body });
    const hits = await fetchAllFromScroll(resp, callWithRequest);

    return {
      ok: true,
      resp: hits.map(({ _source, _id }) => ({ ..._source, _id: getId(_id) }))
    };
  } catch (err) {
    console.error('Signals - getAccounts:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getAccountsRoute(
  server,
  callWithRequestFactory,
  fetchAllFromScroll,
  clusterName,
  plugins
) {
  return {
    path: ROUTE_PATH.ACCOUNTS,
    method: 'POST',
    handler: getAccounts(server, callWithRequestFactory, fetchAllFromScroll, clusterName, plugins),
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
  };
}