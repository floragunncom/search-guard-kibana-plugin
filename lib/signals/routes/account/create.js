import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const createAccount = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { payload: body, params: { id, type } } = request;

    const resp = await callWithRequest('sgSignals.saveAccount', { id, type, body });
    return { ok: true, resp };

  } catch (err) {
    console.error('Signals - createAccount:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function createAccountRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'PUT',
    handler: createAccount(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        params: {
          id: Joi.string().required(),
          type: Joi.string().required(),
        },
        payload: {
          type: Joi.string().required()
        }
      }
    }
  };
}
