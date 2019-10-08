import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getWatchId } from '../../lib/helpers';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const getWatch = (server, callWithRequestFactory) => async request => {
  try {
    const {
      params: { id },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(server, request);
    const { _source, _id } = await callWithRequest('sgSignals.getWatch', { id, sgtenant });
    return { ok: true, resp: { ..._source, _id: getWatchId(_id) } };
  } catch (err) {
    console.error('Signals - getWatch:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getWatchRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.WATCH}/{id}`,
    method: 'GET',
    handler: getWatch(server, callWithRequestFactory),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        params: {
          id: Joi.string().required()
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT)
        }
      }
    }
  };
}
