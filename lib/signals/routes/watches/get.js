import Joi from 'joi';
import {
  getId,
  serverError,
} from '../../lib';
import {
  ROUTE_PATH,
  ES_SCROLL_SETTINGS,
  NO_MULTITENANCY_TENANT,
} from '../../../../utils/signals/constants';

const getWatches = (
  server,
  callWithRequestFactory,
  fetchAllFromScroll,
  clusterName,
  plugins = []
) => async request => {
  try {
    const {
      query: { scroll },
      headers: { sgtenant },
    } = request;

    const callWithRequest = callWithRequestFactory(
      server,
      request,
      clusterName,
      plugins
    );

    const resp = await callWithRequest('sgSignals.getWatches', {
      scroll, sgtenant
    });
    const hits = await fetchAllFromScroll(resp, callWithRequest);

    return {
      ok: true,
      resp: hits.map(h => ({ ...h._source, _id: getId(h._id) }))
    };
  } catch (err) {
    console.error('Signals - getWatches:', err);
    return { ok: false, resp: serverError(err) };
  }
};

export default function getWatchesRoute(
  server,
  callWithRequestFactory,
  fetchAllFromScroll,
  clusterName,
  plugins
) {
  return {
    path: ROUTE_PATH.WATCHES,
    method: 'GET',
    handler: getWatches(
      server,
      callWithRequestFactory,
      fetchAllFromScroll,
      clusterName,
      plugins
    ),
    config: {
      validate: {
        options: {
          allowUnknown: true
        },
        query: {
          scroll: Joi.string().default(ES_SCROLL_SETTINGS.KEEPALIVE)
        },
        headers: {
          sgtenant: Joi.string().default(NO_MULTITENANCY_TENANT).allow('')
        }
      }
    }
  };
}
