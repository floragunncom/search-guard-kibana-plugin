/* eslint-disable @osd/eslint/require-license-header */
import { APP_ROOT } from '../../../../../../utils/constants';

export function customError({ httpResources }) {
  httpResources.register(
    {
      path: `${APP_ROOT}/customerror`,
      options: { authRequired: false },
      validate: false,
    },
    async (context, request, response) => {
      return response.renderAnonymousCoreApp();
    }
  );
}
