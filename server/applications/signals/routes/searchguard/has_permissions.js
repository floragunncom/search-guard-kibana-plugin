/* eslint-disable @kbn/eslint/require-license-header */
import { serverError } from '../../lib';
import { ROUTE_PATH, PERMISSIONS_FOR_ACCESS } from '../../../../../utils/signals/constants';

export function hasPermissions({ logger, searchguardBackendService }) {
  return async function (context, request, response) {
    try {
      const { permissions = {} } = await searchguardBackendService.hasPermissions(
        request.headers,
        PERMISSIONS_FOR_ACCESS
      );

      return response.ok({
        body: {
          ok: true,
          resp: Object.values(permissions).includes(true),
        },
      });
    } catch (err) {
      logger.error(`hasPermissions: ${err.toString()} ${err.stack}`);
      return response.ok({ body: { ok: false, resp: serverError(err) } });
    }
  };
}

export function hasPermissionsRoute({ router, logger, searchguardBackendService }) {
  router.post(
    {
      path: ROUTE_PATH.SEARCHGUARD.SIGNALS_HAS_PERMISSIONS,
      options: { authRequired: false },
      validate: false,
    },
    hasPermissions({ logger, searchguardBackendService })
  );
}
