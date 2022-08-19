/* eslint-disable @kbn/eslint/require-license-header */
import { HeaderUserMenuApp } from './nav';
import { ConfigApp } from './configuration-react';
import { CustomErrorApp } from './customerror';
import { LoginApp } from './login';
import { redirectOnSessionTimeout } from './auth/redirectOnSessionTimeout';

export class SearchGuard {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.configApp = new ConfigApp(coreContext);
    this.customErrorApp = new CustomErrorApp(coreContext);
    this.loginApp = new LoginApp(coreContext);
    this.headerUserMenuApp = new HeaderUserMenuApp();
  }

  setupSync({ core, plugins, httpClient, configService }) {
    redirectOnSessionTimeout(configService.get('searchguard.auth.type'), core.http);
    try {
      this.customErrorApp.setupSync({ core, configService });
      this.configApp.setupSync({ core, plugins, httpClient, configService });
      this.loginApp.setupSync({ core, httpClient, configService });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async start({ core, httpClient, configService }) {
    try {
      this.configApp.start({ configService });
      this.loginApp.start({ configService });

      this.headerUserMenuApp.start({
        core,
        httpClient,
        configService,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
