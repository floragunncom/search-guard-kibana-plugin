export class PublicPlugin {

  constructor(initializerContext, two, three) {
    this.initializerContext = initializerContext;
    this.config = this.initializerContext.config;
  }

  setup(core) {

    core.application.register({
      id: 'accountinfo',
      title: 'todo',
      euiIconType: 'user',
      async mount(params) {
        const { renderApp } = await import('./applications/accountinfo/npstart');

        return renderApp(core, null, params, 'Account');
      }
    });

    // @todo Do we need to add a basePath here?
    core.http.anonymousPaths.register('/login');
    core.application.register({
      id: 'LOGIN',
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