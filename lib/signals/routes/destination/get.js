import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const getDestination = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id } = request.params;

    const { _source, _id } = await callWithRequest('sgSignals.getDestination', { id });
    return { ok: true, resp: { ..._source, _id } };

  } catch (err) {
    console.error('Signals - getDestination:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getDestinationRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.DESTINATION}/{id}`,
    method: 'GET',
    handler: getDestination(server, callWithRequestFactory),
    config: {
      validate: {
        params: {
          id: Joi.string().required()
        }
      }
    }
  };
}
