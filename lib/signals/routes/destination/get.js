import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const getDestination = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id, type } = request.params;
    console.log('getDestinaton params', request.params);

    const { _source, _id } = await callWithRequest('sgSignals.getDestination', { id, type });
    return { ok: true, resp: { ..._source, _id: getId(_id) } };

  } catch (err) {
    console.error('Signals - getDestination:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getDestinationRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.DESTINATION}/{type}/{id}`,
    method: 'GET',
    handler: getDestination(server, callWithRequestFactory),
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
