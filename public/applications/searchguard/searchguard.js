/* eslint-disable @kbn/eslint/require-license-header */
import { HeaderUserMenuApp } from './nav';
import { ConfigApp } from './configuration-react';
import { CustomErrorApp } from './customerror';
import { LoginApp } from './login';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';
import { ChromeHelper } from '../../services';

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.configApp = new ConfigApp(coreContext);
    this.customErrorApp = new CustomErrorApp(coreContext);
    this.loginApp = new LoginApp(coreContext);
    this.headerUserMenuApp = new HeaderUserMenuApp();
  }

  setupSync({ core, plugins, httpClient, configService }) {
    try {
      this.chromeHelper = new ChromeHelper();

      this.customErrorApp.setupSync({ core, configService });
      this.configApp.setupSync({ core, plugins, httpClient, configService });
      this.loginApp.setupSync({ core, httpClient, configService });

      return { chromeHelper: this.chromeHelper };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async start({ core, httpClient, configService }) {
    try {
      const didSetupSyncRun = this.chromeHelper;
      if (!didSetupSyncRun) {
        throw new Error('You must run setupSync first!');
      }

      this.configApp.start({ configService });
      this.loginApp.start({ configService });

      // Make sure the chrome helper has access to coreStart.chrome
      this.chromeHelper.start(core.chrome);

      this.headerUserMenuApp.start({
        core,
        httpClient,
        configService,
      });

      redirectOnSessionTimeout(configService.get('searchguard.auth.type'), core.http);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
