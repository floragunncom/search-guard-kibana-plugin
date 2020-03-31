/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI, MAX_DOC_COUNT_SEARCH } from '../../../../../utils/signals/constants';

const searchEs = ({ clusterClient }) => async request => {
  try {
    const { body, index, size } = request.payload;

    const resp = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('search', { body, index, size });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - searchEs:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export function searchEsRoute({ hapiServer, clusterClient }) {
  hapiServer.route({
    path: `${BASE_URI}/_search`,
    method: 'POST',
    handler: searchEs({ clusterClient }),
    config: {
      validate: {
        payload: {
          body: Joi.object().required(),
          index: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
          size: Joi.number().default(MAX_DOC_COUNT_SEARCH),
        },
      },
    },
  });
}
