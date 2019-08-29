import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../utils/signals/constants';

const getMappings = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { index } = request.payload;
    const resp = await callWithRequest('indices.getMapping', { index });
    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - getMappings:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getMappingsRoute(server, callWithRequestFactory) {
  return {
    path: `${BASE_URI}/_mappings`,
    method: 'POST',
    handler: getMappings(server, callWithRequestFactory),
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
