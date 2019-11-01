import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const createDestination = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { payload: body, params: { id, type } } = request;
    console.log('createDestinaton params', request.params);

    const resp = await callWithRequest('sgSignals.saveDestination', { id, type, body });
    return { ok: true, resp };

  } catch (err) {
    console.error('Signals - createDestination:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function createDestinationRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.DESTINATION}/{type}/{id}`,
    method: 'PUT',
    handler: createDestination(server, callWithRequestFactory),
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
