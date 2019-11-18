import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const deleteAccount = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id, type } = request.params;

    const resp = await callWithRequest('sgSignals.deleteAccount', { id, type });
    return { ok: true, resp };

  } catch (err) {
    console.error('Signals - deleteAccount:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function deleteAccountRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'DELETE',
    handler: deleteAccount(server, callWithRequestFactory),
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
