import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH } from '../../../../utils/signals/constants';

const getAccount = (
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) => async request => {
  try {
    const { id, type } = request.params;

    const callWithRequest = callWithRequestFactory(
      server,
      request,
      clusterName,
      plugins
    );

    const { _source, _id } = await callWithRequest('sgSignals.getAccount', {
      id, type
    });

    return {
      ok: true,
      resp: { ..._source, _id: getId(_id) }
    };
  } catch (err) {
    console.error('Signals - getAccount:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getAccountRoute(
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) {
  return {
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'GET',
    handler: getAccount(
      server,
      callWithRequestFactory,
      clusterName,
      plugins
    ),
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
