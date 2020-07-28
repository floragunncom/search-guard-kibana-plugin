/* eslint-disable @kbn/eslint/require-license-header */
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export class AccountInfo {
  setup({ core, httpClient, configService }) {
    core.application.register({
      id: 'searchguard-accountinfo',
      title: 'Account',
      category: SEARCHGUARD_APP_CATEGORY,
      mount: async (params) => {
        const { renderApp } = await import('./npstart');
        return renderApp({
          element: params.element,
          httpClient,
          configService,
        });
      },
    });
  }
}
