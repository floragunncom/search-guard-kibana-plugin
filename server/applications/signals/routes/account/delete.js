/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';

const deleteAccount = ({ clusterClient }) => async request => {
  try {
    const { id, type } = request.params;

    const resp = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('sgSignals.deleteAccount', {
        id,
        type,
      });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - deleteAccount:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export function deleteAccountRoute({ hapiServer, clusterClient }) {
  hapiServer.route({
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'DELETE',
    handler: deleteAccount({ clusterClient }),
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
