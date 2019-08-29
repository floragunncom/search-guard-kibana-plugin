import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { BASE_URI } from '../../../../utils/signals/constants';

const getAliases = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { alias } = request.payload;
    const resp = await callWithRequest('cat.aliases', {
      alias,
      format: 'json',
      h: 'alias,index'
    });
    return { ok: true, resp };
  } catch (err) {
    console.error('Signals - getAliases:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getAliasesRoute(server, callWithRequestFactory) {
  return {
    path: `${BASE_URI}/_aliases`,
    method: 'POST',
    handler: getAliases(server, callWithRequestFactory),
    config: {
      validate: {
        payload: {
          alias: Joi.alternatives().try(
            Joi.string(),
            Joi.array().items(Joi.string())
          ).required()
        }
      }
    }
  };
}
