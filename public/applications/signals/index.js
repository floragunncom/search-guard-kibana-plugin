/* eslint-disable @kbn/eslint/require-license-header */
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export class Signals {
  setup({ core, httpClient }) {
    core.application.register({
      id: 'searchguard-signals',
      title: 'Signals',
      category: SEARCHGUARD_APP_CATEGORY,
      mount: async ({ element }) => {
        const { renderApp } = await import('./npstart');

        return renderApp({ element, core, httpClient });
      },
    });
  }
}
