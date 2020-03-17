import { sgContext, sgConfig } from "./utils/sgContext";

export class PublicPlugin {

  constructor(initializerContext, two, three) {
    this.initializerContext = initializerContext;
    this.config = this.initializerContext.config;
  }

  setup(core) {
    console.log('What the config', this.config.get())

    // Set up context
    sgContext.kibanaCore = core;
    sgConfig.injectedValues = this.config.get();

    // Original setup of the chrome/core object
    console.log('What is sgContext', sgConfig.get('multitenancysomething'))

    core.application.register({
      id: 'searchguard-accountinfo',
      title: 'todo',
      euiIconType: 'user',
      async mount(params) {
        const { renderApp } = await import('./applications/accountinfo/npstart');

        return renderApp(core, null, params, 'Account');
      }
    });

    // @todo Only register apps if they are enabled in the config!

    core.application.register({
      id: 'searchguard-configuration',
      title: 'SearchGuard Configuration',
      icon: 'plugins/searchguard/assets/searchguard_logo_left_navbar.svg',
      //euiIconType: 'user',
      mount: async(params) => {
        const { renderApp } = await import('./applications/configuration-react/npstart');

        return renderApp(core, null, params, this.config);
      }
    });

    core.application.register({
      id: 'searchguard-multitenancy',
      title: 'Multitenancy',
      icon: 'plugins/searchguard/assets/networking.svg',
      //euiIconType: 'user',
      mount: async(params) => {
        const { renderApp } = await import('./applications/multitenancy/npstart');

        return renderApp(core, null, params, this.config);
      }
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
      }
    });

  }

  start() {

  }

  stop() {}
}