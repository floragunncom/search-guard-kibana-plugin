import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

// TODO: add test
const ackWatch = (server, callWithRequestFactory) => async request => {
  try {
    const {
      params: { watchId, actionId },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request);
    const resp = actionId
      ? await callWithRequest('sgSignals.ackWatchAction', { watchId, actionId, sgtenant })
      : await callWithRequest('sgSignals.ackWatch', { id: watchId, sgtenant });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - ackWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function ackWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/{watchId}/_ack/{actionId?}`,
    method: 'PUT',
    handler: ackWatch(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow('')
        },
        params: {
          watchId: Joi.string().required(),
          actionId: Joi.string()
        }
      }
    }
  };
}
