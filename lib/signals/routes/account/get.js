import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const getAccount = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id, type } = request.params;

    const { _source, _id } = await callWithRequest('sgSignals.getAccount', { id, type });
    return { ok: true, resp: { ..._source, _id: getId(_id) } };

  } catch (err) {
    console.error('Signals - getAccount:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getAccountRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'GET',
    handler: getAccount(server, callWithRequestFactory),
    config: {
      validate: {
        params: {
          id: Joi.string().required(),
          type: Joi.string().required(),
        }
      }
    }
  };
}
