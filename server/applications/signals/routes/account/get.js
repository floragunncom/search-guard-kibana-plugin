/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { getId } from '../../lib/helpers';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';

const getAccount = ({ clusterClient }) => async request => {
  try {
    const { id, type } = request.params;

    const { _source, _id } = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('sgSignals.getAccount', {
        id,
        type,
      });

    return {
      ok: true,
      resp: { ..._source, _id: getId(_id) },
    };
  } catch (err) {
    if (err.statusCode !== 404) {
      console.error('Signals - getAccount:', err);
    }
    return { ok: false, resp: serverError(err) };
  }
};

export function getAccountRoute({ hapiServer, clusterClient }) {
  hapiServer.route({
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'GET',
    handler: getAccount({ clusterClient }),
    config: {
      validate: {
        params: {
          id: Joi.string().required(),
          type: Joi.string().required(),
        },
      },
    },
  });
}
