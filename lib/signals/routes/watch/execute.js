import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const executeWatch = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { watch } = request.payload;
    const { data: resp } = await callWithRequest('sgSignals.executeWatch', { body: { watch } });
    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - executeWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function executeWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/_execute`,
    method: 'POST',
    handler: executeWatch(server, callWithRequestFactory),
    config: {
      validate: {
        payload: {
          watch: Joi.object().required()
        }
      }
    }
  };
}
