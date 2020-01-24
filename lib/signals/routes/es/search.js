import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI, MAX_DOC_COUNT_SEARCH } from '../../../../utils/signals/constants';

const searchEs = (
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) => async request => {
  try {
    const { body, index, size } = request.payload;
    const callWithRequest = callWithRequestFactory(
      server,
      request,
      clusterName,
      plugins
    );

    const resp = await callWithRequest('search', { body, index, size });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - searchEs:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function searchEsRoute(
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) {
  return {
    path: `${BASE_URI}/_search`,
    method: 'POST',
    handler: searchEs(
      server,
      callWithRequestFactory,
      clusterName,
      plugins
    ),
    config: {
      validate: {
        payload: {
          body: Joi.object().required(),
          index: Joi.alternatives().try(
            Joi.string(),
            Joi.array().items(Joi.string())
          ),
          size: Joi.number().default(MAX_DOC_COUNT_SEARCH)
        }
      }
    }
  };
}
