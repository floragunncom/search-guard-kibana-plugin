import Joi from 'joi';
import { serverError } from '../../lib/errors';
import { ROUTE_PATH, INDEX } from '../../../../utils/signals/constants';

const deleteAlert = (server, callWithRequestFactory) => async request => {
  try {
    const callWithRequest = callWithRequestFactory(server, request);
    const { id, index } = request.params;
    const resp = await callWithRequest('delete', {
      refresh: true,
      type: INDEX.ALERT_DOC_TYPE,
      index,
      id: id.replace('%2F')
    });
    return { ok: resp.result === 'deleted', resp };
  } catch (err) {
    console.error('Signals - deleteAlert:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function deleteAlertRoute(server, callWithRequestFactory) {
  return {
    path: `${ROUTE_PATH.ALERT}/{index}/{id}`,
    method: 'DELETE',
    handler: deleteAlert(server, callWithRequestFactory),
    config: {
      validate: {
        params: {
          id: Joi.string().required(),
          index: Joi.string().required()
        }
      }
    }
  };
}
