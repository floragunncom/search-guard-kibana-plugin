import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../utils/signals/constants';

const getMappings = (
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) => async request => {
  try {
    const { index } = request.payload;
    const callWithRequest = callWithRequestFactory(
      server,
      request,
      clusterName,
      plugins
    );

    const resp = await callWithRequest('indices.getMapping', { index });

    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - getMappings:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getMappingsRoute(
  server,
  callWithRequestFactory,
  clusterName,
  plugins
) {
  return {
    path: `${BASE_URI}/_mappings`,
    method: 'POST',
    handler: getMappings(
      server,
      callWithRequestFactory,
      clusterName,
      plugins
    ),
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
