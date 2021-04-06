/* eslint-disable @kbn/eslint/require-license-header */
import { HeaderUserMenuApp } from './nav';
import { ConfigApp } from './configuration-react';
import { CustomErrorApp } from './customerror';
import { LoginApp } from './login';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';
import { ChromeHelper, ApiService } from '../../services';
import { ConfigService } from './configuration-react/services';

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.configApp = new ConfigApp(coreContext);
    this.customErrorApp = new CustomErrorApp(coreContext);
    this.loginApp = new LoginApp(coreContext);
    this.headerUserMenuApp = new HeaderUserMenuApp();
  }

  setupSync({ core, plugins, httpClient }) {
    try {
      const apiService = new ApiService(httpClient);
      this.configService = new ConfigService({
        apiService,
        uiSettings: core.uiSettings,
        coreContext: this.coreContext,
      });

      this.chromeHelper = new ChromeHelper();

      this.customErrorApp.setupSync({ core, configService: this.configService });
      this.configApp.setupSync({ core, plugins, httpClient, configService: this.configService });
      this.loginApp.setupSync({ core, httpClient, configService: this.configService });

      return { chromeHelper: this.chromeHelper };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async start({ core, httpClient }) {
    try {
      const didSetupSyncRun = this.chromeHelper && this.configService;
      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      await this.configService.fetchConfig();

      this.configApp.start({ configService: this.configService });
      this.loginApp.start({ configService: this.configService });

      // Make sure the chrome helper has access to coreStart.chrome
      this.chromeHelper.start(core.chrome);

      this.headerUserMenuApp.start({
        core,
        httpClient,
        configService: this.configService,
      });

      redirectOnSessionTimeout(this.configService.get('searchguard.auth.type'), core.http);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
