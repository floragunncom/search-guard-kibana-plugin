/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH } from '../../../../../utils/signals/constants';

const createAccount = ({ clusterClient, logger }) => async request => {
  try {
    const {
      payload: body,
      params: { id, type },
    } = request;

    const resp = await clusterClient.asScoped(request).callAsCurrentUser('sgSignals.saveAccount', {
      id,
      type,
      body,
    });

    return { ok: true, resp };
  } catch (err) {
    logger.error(`createAccount: ${err.toString()} ${err.stack}`);
    return { ok: false, resp: serverError(err) };
  }
};

export function createAccountRoute({ hapiServer, clusterClient, logger }) {
  hapiServer.route({
    path: `${ROUTE_PATH.ACCOUNT}/{type}/{id}`,
    method: 'PUT',
    handler: createAccount({ clusterClient, logger }),
    config: {
      validate: {
        options: {
          allowUnknown: true,
        },
        params: {
          id: Joi.string().required(),
          type: Joi.string().required(),
        },
        payload: {
          type: Joi.string().required(),
        },
      },
    },
  });
}
