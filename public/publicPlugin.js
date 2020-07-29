/* eslint-disable @kbn/eslint/require-license-header */
import { HttpWrapper } from './utils/httpWrapper';
import { ApiService, ConfigService } from './services';
import { Signals } from './applications/signals/Signals';
import { SearchGuard } from './applications/searchguard';
import { AccountInfo } from './applications/accountinfo';
import { MultiTenancy } from './applications/multitenancy';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.signalsApp = new Signals();
    this.searchGuardApp = new SearchGuard(this.initializerContext);
    this.accountInfoApp = new AccountInfo(this.initializerContext);
    this.multiTenancyApp = new MultiTenancy(this.initializerContext);
  }

  /*
  ATTENTION! Kibana imposes restrictions to the plugin lifecycle methods:
  1. A method must not return promise.
  2. A method execution time limit is 10 seconds.
  */
  setup(core, plugins) {
    this.httpClient = new HttpWrapper(core.http);
    const apiService = new ApiService(this.httpClient);

    this.configService = new ConfigService({
      apiService,
      uiSettings: core.uiSettings,
      coreContext: this.initializerContext,
    });

    const { chromeHelper } = this.searchGuardApp.setupSync({
      core,
      plugins,
      chromeHelper: this.chromeHelper,
      httpClient: this.httpClient,
      configService: this.configService,
    });

    this.signalsApp.setupSync({ core, httpClient: this.httpClient });

    this.accountInfoApp.setupSync({
      core,
      httpClient: this.httpClient,
      configService: this.configService,
    });

    this.multiTenancyApp.setupSync({
      core,
      plugins,
      chromeHelper,
      httpClient: this.httpClient,
      configService: this.configService,
    });
  }

  start(core) {
    (async () => {
      await this.configService.init();

      this.searchGuardApp.start({
        core,
        httpClient: this.httpClient,
        configService: this.configService,
      });

      this.accountInfoApp.start({ configService: this.configService });
      this.multiTenancyApp.start({ configService: this.configService });
    })();

    this.signalsApp.start({ httpClient: this.httpClient });
  }
}
