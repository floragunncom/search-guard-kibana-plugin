/* eslint-disable @kbn/eslint/require-license-header */

export class Signals {
  setup({ core, httpClient }) {
    core.application.register({
      id: 'searchguard-signals',
      title: 'Search Guard Signals',
      icon: 'plugins/searchguard/apps/signals/assets/signals_logo_64.svg',
      mount: async ({ element }) => {
        const { renderApp } = await import('./npstart');

        return renderApp({ element, core, httpClient });
      },
    });
  }
}
