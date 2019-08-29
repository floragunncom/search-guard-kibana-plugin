import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../utils/signals/constants';

const getIndices = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
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
            }
          }
        },
      }
    };

    const {
      aggregations: { indices: { buckets = [] } = {} } = {}
    } = await callWithRequest('search', options);

    return {
      ok: true,
      resp: buckets.map(({ key }) => ({
        index: key,
        health: 'green', // TODO: find real health instead
        status: 'open' // TODO: find real status instead
      }))
    };
  } catch (err) {
    console.error('Signals - getIndices:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getIndicesRoute(server, callWithRequestFactory) {
  return {
    path: `${BASE_URI}/_indices`,
    method: 'POST',
    handler: getIndices(server, callWithRequestFactory),
    config: {
      validate: {
        payload: {
          index: Joi.alternatives().try(
            Joi.string(),
            Joi.array().items(Joi.string())
          ).required()
        }
      }
    }
  };
}
