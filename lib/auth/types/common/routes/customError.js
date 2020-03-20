/* eslint-disable @kbn/eslint/require-license-header */
import { APP_ROOT } from '../../../../../server/utils/constants';

export function customError({ router, headers }) {
  router.get(
    {
      path: `${APP_ROOT}/customerror`,
      options: { authRequired: false },
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: await context.core.rendering.render({
          // Including user settings would cause a SO-call,
          // which in turn throws an Authentication Exception
          includeUserSettings: false,
        }),
        headers,
      });
    }
  );
}
