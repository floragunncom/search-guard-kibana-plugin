import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import {
  ROUTE_PATH,
  ES_SCROLL_SETTINGS,
} from '../../../../utils/signals/constants';

const getAccounts = (server, callWithRequestFactory, fetchAllFromScroll) => async request => {
  try {
    const { scroll } = request.query;
    const callWithRequest = callWithRequestFactory(server, request);

    const resp = await callWithRequest('sgSignals.getAccounts', { scroll });
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

export default function getAccountsRoute(server, callWithRequestFactory, fetchAllFromScroll) {
  return {
    path: ROUTE_PATH.ACCOUNTS,
    method: 'GET',
    handler: getAccounts(server, callWithRequestFactory, fetchAllFromScroll),
    config: {
      validate: {
        query: {
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE)
        }
      }
    }
  };
}
