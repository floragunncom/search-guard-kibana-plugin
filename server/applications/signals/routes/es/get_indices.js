/* eslint-disable @kbn/eslint/require-license-header */
import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../../utils/signals/constants';

const getIndices = ({ clusterClient, logger }) => async request => {
  try {
    const { index } = request.payload;
    const options = {
      ignoreUnavailable: true,
      index,
      ignore: [404],
      body: {
        size: 0, // no hits
        aggs: {
          indices: {
            terms: {
              field: '_index',
              size: 800,
            },
          },
        },
      },
    };

    const { aggregations: { indices: { buckets = [] } = {} } = {} } = await clusterClient
      .asScoped(request)
      .callAsCurrentUser('search', options);

    return {
      ok: true,
      resp: buckets.map(({ key }) => ({
        index: key,
        health: 'green', // TODO: find real health instead
        status: 'open', // TODO: find real status instead
      })),
    };
  } catch (err) {
    logger.error(`getIndices: ${err.toString()} ${err.stack}`);
    return { ok: false, resp: serverError(err) };
  }
};

export function getIndicesRoute({ hapiServer, clusterClient, logger }) {
  hapiServer.route({
    path: `${BASE_URI}/_indices`,
    method: 'POST',
    handler: getIndices({ clusterClient, logger }),
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
