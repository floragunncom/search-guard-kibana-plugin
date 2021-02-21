/*
 *    Copyright 2021 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpWrapper } from './utils/httpWrapper';
import {
  ApiService,
  ConfigService,
  KibanaCoreApplicationService,
  KibanaCoreChromeService,
} from './services';
import { Signals } from './applications/signals/Signals';
import { SearchGuard } from './applications/searchguard';
import { AccountInfo } from './applications/accountinfo';
import { MultiTenancy } from './applications/multitenancy';
import { AuthTokens } from './applications/authtokens';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.signalsApp = new Signals();
    this.searchGuardApp = new SearchGuard(this.initializerContext);
    this.accountInfoApp = new AccountInfo(this.initializerContext);
    this.multiTenancyApp = new MultiTenancy(this.initializerContext);
    this.authTokensApp = new AuthTokens(this.initializerContext);
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

    this.authTokensApp.setupSync({
      core,
      httpClient: this.httpClient,
      configService: this.configService,
    });
  }

  start(core) {
    this.kibanaAppService = new KibanaCoreApplicationService(core);
    this.kibanaChromeService = new KibanaCoreChromeService(core);

    (async () => {
      await this.configService.init();

      this.searchGuardApp.start({
        core,
        kibanaAppService: this.kibanaAppService,
        kibanaChromeService: this.kibanaChromeService,
        httpClient: this.httpClient,
        configService: this.configService,
      });

      this.accountInfoApp.start({ configService: this.configService });
      this.multiTenancyApp.start({ configService: this.configService });
      this.authTokensApp.start({ configService: this.configService });
    })();

    this.signalsApp.start({ httpClient: this.httpClient });
  }
}
