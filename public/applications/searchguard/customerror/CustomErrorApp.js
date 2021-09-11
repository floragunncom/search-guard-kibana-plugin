/* eslint-disable @osd/eslint/require-license-header */

export class CustomErrorApp {
  constructor(coreContext) {
    this.coreContext = coreContext;
  }

  mount({ core, configService }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.fetchConfig()]);

      return renderApp({
        element: params.element,
        basePath: core.http.basePath.get(),
        config: configService.getConfig(),
      });
    };
  }

  setupSync({ core, configService }) {
    core.http.anonymousPaths.register('/customerror');

    core.application.register({
      id: 'customerror',
      title: 'SearchGuard Custom Error',
      chromeless: true,
      appRoute: '/customerror',
      mount: this.mount({ core, configService }),
    });
  }
}
