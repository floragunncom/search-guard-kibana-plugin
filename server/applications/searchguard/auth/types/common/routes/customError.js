/* eslint-disable @kbn/eslint/require-license-header */
import { APP_ROOT } from '../../../../../../utils/constants';

export function customError({ httpResources }) {
  httpResources.register(
    {
      path: `${APP_ROOT}/customerror`,
      validate: false,
      security: {
        authc: { enabled: false, reason: 'Route renders auth errors for unauthenticated users.' },
        authz: { enabled: false, reason: 'Route is part of the login flow.' },
      },
    },
    async (context, request, response) => {
      return response.renderAnonymousCoreApp();
    }
  );
}
