/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, INDEX } from '../../../../../utils/signals/constants';

const deleteAlert = ({ clusterClient, logger }) => async request => {
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
    logger.error(`deleteAlert: ${err.toString()} ${err.stack}`);
    return { ok: false, resp: serverError(err) };
  }
};

export function deleteAlertRoute({ hapiServer, clusterClient, logger }) {
  hapiServer.route({
    path: `${ROUTE_PATH.ALERT}/{index}/{id}`,
    method: 'DELETE',
    handler: deleteAlert({ clusterClient, logger }),
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
