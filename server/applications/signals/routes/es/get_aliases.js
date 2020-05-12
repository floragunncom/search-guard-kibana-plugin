/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../../utils/signals/constants';

const getAliases = ({ clusterClient, logger }) => async request => {
  try {
    const { alias } = request.payload;
    const resp = await clusterClient.asScoped(request).callAsCurrentUser('cat.aliases', {
      alias,
      format: 'json',
      h: 'alias,index',
    });

    return { ok: true, resp };
  } catch (err) {
    logger.error(`getAliases: ${err.toString()} ${err.stack}`);
    return { ok: false, resp: serverError(err) };
  }
};

export function getAliasesRoute({ hapiServer, clusterClient, logger }) {
  hapiServer.route({
    path: `${BASE_URI}/_aliases`,
    method: 'POST',
    handler: getAliases({ clusterClient, logger }),
    config: {
      validate: {
        payload: {
          alias: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .required(),
        },
      },
    },
  });
}
