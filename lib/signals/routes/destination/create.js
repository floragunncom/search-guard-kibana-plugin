import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const createDestination = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { payload: body, params: { id } } = request;

    const resp = await callWithRequest('sgSignals.saveDestination', { id, body });
    return { ok: true, resp };

  } catch (err) {
    console.error('Signals - createDestination:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function createDestinationRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.DESTINATION}/{id}`,
    method: 'PUT',
    handler: createDestination(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        params: {
          id: Joi.string().required()
        },
        payload: {
          type: Joi.string().required()
        }
      }
    }
  };
}
