import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const executeGraphWatch = (server, callWithRequestFactory) => async request => {
  try {
    const { request: { indices: index, body } } = request.payload;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = await callWithRequest('search', { body, index });
    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - executeGraphWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function executeGraphWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/_execute_graph`,
    method: 'POST',
    handler: executeGraphWatch(server, callWithRequestFactory),
    config: {
      validate: {
        payload: {
          request: Joi.object({
            indices: Joi.array().required(),
            body: Joi.object().required()
          }).required()
        }
      }
    }
  };
}
