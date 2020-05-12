/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../../utils/signals/constants';

const getMappings = ({ clusterClient, logger }) => async request => {
  try {
    const { index } = request.payload;

    const resp = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('indices.getMapping', { index });

    return { ok: true, resp };
  } catch (err) {
    logger.error(`getMappings: ${err.toString()} ${err.stack}`);
    return { ok: false, resp: serverError(err) };
  }
};

export function getMappingsRoute({ hapiServer, clusterClient, logger }) {
  hapiServer.route({
    path: `${BASE_URI}/_mappings`,
    method: 'POST',
    handler: getMappings({ clusterClient, logger }),
    config: {
      validate: {
        payload: {
          index: Joi.alternatives()
            .try(Joi.string(), Joi.array().items(Joi.string()))
            .required(),
        },
      },
    },
  });
}
