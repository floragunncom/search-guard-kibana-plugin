import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH, NO_MULTITENANCY_TENANT } from '../../../../utils/signals/constants';

const getWatch = (
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) => async request => {
  try {
    const {
      params: { id },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(
      server,
      request,
      clusterName,
      plugins
    );

    const { _source, _id } = await callWithRequest('sgSignals.getWatch', {
      id, sgtenant
    });

    return { ok: true, resp: { ..._source, _id: getId(_id) } };
  } catch (err) {
    if (err.statusCode !== 404) {
      console.error('Signals - getWatch:', err);
    }
    return { ok: false, resp: serverError(err) };
  }
};

export default function getWatchRoute(
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) {
  return {
    path: `${ROUTE_PATH.WATCH}/{id}`,
    method: 'GET',
    handler: getWatch(
      server,
      callWithRequestFactory,
      clusterName,
      plugins
    ),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        params: {
          id: Joi.string().required()
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow('')
        }
      }
    }
  };
}
