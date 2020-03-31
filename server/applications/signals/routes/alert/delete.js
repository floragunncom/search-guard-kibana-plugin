/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, INDEX } from '../../../../../utils/signals/constants';

const deleteAlert = ({ clusterClient }) => async request => {
  try {
    const { id, index } = request.params;

    const resp = await clusterClient.asScoped(request).callAsCurrentUser('delete', {
      refresh: true,
      type: INDEX.ALERT_DOC_TYPE,
      index,
      id: id.replace('%2F'),
    });

    return { ok: resp.result === 'deleted', resp };
  } catch (err) {
    console.error('Signals - deleteAlert:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export function deleteAlertRoute({ hapiServer, clusterClient }) {
  hapiServer.route({
    path: `${ROUTE_PATH.ALERT}/{index}/{id}`,
    method: 'DELETE',
    handler: deleteAlert({ clusterClient }),
    config: {
      validate: {
        params: {
          id: Joi.string().required(),
          index: Joi.string().required(),
        },
      },
    },
  });
}
