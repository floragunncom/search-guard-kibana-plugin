/* eslint-disable @kbn/eslint/require-license-header */
import { sgContext, sgConfig } from './utils/sgContext';
import { LogOutService } from './applications/nav';
import { HttpWrapper } from './utils/httpWrapper';
import { SystemStateService } from './services/SystemStateService';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.config = this.initializerContext.config;
    this.logOutService = new LogOutService();
  }

  setup(core) {
    console.log('What the config', this.config.get());
    this.httpClient = new HttpWrapper(core.http);
    this.systemStateService = new SystemStateService(this.httpClient);

    // Set up context
    sgContext.kibanaCore = core;
    sgConfig.injectedValues = this.config.get();

    core.application.register({
      id: 'searchguard-accountinfo',
      title: 'todo',
      euiIconType: 'user',
      async mount(params) {
        const { renderApp } = await import('./applications/accountinfo/npstart');

        return renderApp(core, null, params, 'Account');
      },
    });

    // @todo Only register apps if they are enabled in the config!

    core.application.register({
      id: 'searchguard-configuration',
      title: 'SearchGuard Configuration',
      icon: 'plugins/searchguard/assets/searchguard_logo_left_navbar.svg',
      mount: async ({ element }) => {
        const { renderApp } = await import('./applications/configuration-react');

        return renderApp({ element, httpClient: this.httpClient });
      },
    });

    core.application.register({
      id: 'searchguard-multitenancy',
      title: 'Multitenancy',
      icon: 'plugins/searchguard/assets/networking.svg',
      //euiIconType: 'user',
      mount: async params => {
        const { renderApp } = await import('./applications/multitenancy/npstart');

        return renderApp(core, null, params, this.config);
      },
    });

    // @todo Do we need to add a basePath here?
    core.http.anonymousPaths.register('/login');
    core.application.register({
      id: 'searchguard-login',
      //title: 'todo',
      chromeless: true,
      appRoute: '/login',
      euiIconType: 'user',
      async mount(params) {
        const { renderApp } = await import('./applications/login/npstart');

        return renderApp(core, null, params, 'Login');
      },
    });

    core.http.anonymousPaths.register('/customerror');
    core.application.register({
      id: 'customerror',
      title: 'SearchGuard Custom Error',
      chromeless: true,
      appRoute: '/customerror',
      mount: async ({ element }) => {
        const { renderApp } = await import('./applications/customerror');

        return renderApp({
          element,
          basePath: core.http.basePath.get(),
          config: this.config.get(),
        });
      },
    });
  }

  async start(core) {
    await this.systemStateService.loadSystemInfo();
    const restInfo = await this.systemStateService.loadRestInfo();

    await this.logOutService.start({
      core,
      httpClient: this.httpClient,
      config: { ...this.config.get(), userName: restInfo.user_name },
    });
  }

  stop() {}
}
