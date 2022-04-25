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
import { ApiService, ConfigService } from './services';
import { Signals } from './applications/signals/Signals';
import { SearchGuard } from './applications/searchguard';
import { AuthTokens } from './applications/authtokens';
import { MultiTenancy } from './applications/multitenancy';

export class PublicPlugin {
  constructor(initializerContext) {
    this.initializerContext = initializerContext;
    this.signalsApp = new Signals();
    this.searchGuardApp = new SearchGuard(this.initializerContext);
    this.authTokensApp = new AuthTokens(this.initializerContext);
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

    this.searchGuardApp.setupSync({
      core,
      plugins,
      httpClient: this.httpClient,
      configService: this.configService,
    });

    this.authTokensApp.setupSync({
      core,
      httpClient: this.httpClient,
      configService: this.configService,
    });

    this.signalsApp.setupSync({ core, httpClient: this.httpClient });
    this.signalsApp.setup({ httpClient: this.httpClient, configService: this.configService });
  }

  start(core) {
    (async () => {
      await this.configService.fetchConfig();

      this.searchGuardApp.start({
        core,
        httpClient: this.httpClient,
        configService: this.configService,
      });

      this.authTokensApp.start({
        configService: this.configService,
        configService: this.configService,
      });

      this.signalsApp.start({ httpClient: this.httpClient, configService: this.configService });

      this.multiTenancyApp.start({
        core,
        httpClient: this.httpClient,
        configService: this.configService,
      });
    })();
  }
}
