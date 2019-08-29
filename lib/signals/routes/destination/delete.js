import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const deleteDestination = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id } = request.params;

    const resp = await callWithRequest('sgSignals.deleteDestination', { id });
    return { ok: true, resp };

  } catch (err) {
    console.error('Signals - deleteDestination:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function deleteDestinationRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.DESTINATION}/{id}`,
    method: 'DELETE',
    handler: deleteDestination(server, callWithRequestFactory),
    config: {
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  };
}
