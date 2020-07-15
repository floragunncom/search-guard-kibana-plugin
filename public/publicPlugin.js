/* eslint-disable @kbn/eslint/require-license-header */
import { HttpWrapper } from './utils/httpWrapper';
import { Signals } from './applications/signals';
import { SearchGuard } from './applications/searchguard';
import { AccountInfo } from './applications/accountinfo';
import { MultiTenancy } from './applications/multitenancy';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.signalsApp = new Signals();
    this.searchGuardApp = new SearchGuard(this.initializerContext);
    this.accountInfoApp = new AccountInfo();
    this.multiTenancyApp = new MultiTenancy();
  }

  async setup(core, plugins) {
    this.httpClient = new HttpWrapper(core.http);

    const { configService, chromeHelper } = await this.searchGuardApp.setup({
      core,
      plugins,
      httpClient: this.httpClient,
    });

    this.configService = configService;

    try {
      this.signalsApp.setup({ core, httpClient: this.httpClient });
    } catch (error) {
      console.error(`Signals: ${error.toString()} ${error.stack}`);
    }

    if (this.configService.get('searchguard.accountinfo.enabled')) {
      try {
        this.accountInfoApp.setup({
          core,
          httpClient: this.httpClient,
          configService: this.configService,
        });
      } catch (error) {
        console.error(`Accountinfo: ${error.toString()} ${error.stack}`);
      }
    }

    if (this.configService.get('searchguard.multitenancy.enabled')) {
      try {
        this.multiTenancyApp.setup({
          core,
          plugins,
          chromeHelper,
          httpClient: this.httpClient,
          configService: this.configService,
        });
      } catch (error) {
        console.error(`Multitenancy: ${error.toString()} ${error.stack}`);
      }
    }
  }

  async start(core) {
    this.searchGuardApp.start({ core, httpClient: this.httpClient });
  }

  stop() {}
}
