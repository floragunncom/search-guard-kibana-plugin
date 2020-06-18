/* eslint-disable @kbn/eslint/require-license-header */
import Boom from 'boom';

export function onHapiPreHandler(clusterClient) {
  return async function(req, h) {
    const isKibanaInternalSearch = req.path.includes('/internal/search');

    // Override Kibana internal search.
    // Because Kibana async_search is not handled by SG ES plugin for now.
    if (isKibanaInternalSearch) {
      const { params } = req.payload;

      try {
        let rawResponse;

        if (req.method.toLowerCase() === 'post') {
          rawResponse = await clusterClient(req, 'search', {
            index: params.index,
            body: params.body,
            allow_no_indices: true,
            allow_partial_search_results: true,
            ignore_throttled: true,
            ignore_unavailable: true,
          });
        } else if (req.method.toLowerCase() === 'delete') {
          rawResponse = await clusterClient(req, 'delete', { id: req.params.id });
        } else {
          throw Boom.notImplemented(
            'The only available methods for /internal/search: POST and DELETE.'
          );
        }

        return h
          .response({
            is_partial: false,
            is_running: false,
            rawResponse,
          })
          .code(200)
          .takeover();
      } catch (err) {
        throw Boom.boomify(err, {
          statusCode: err.statusCode,
          message: err.message,
        });
      }
    }

    return h.continue;
  };
}
