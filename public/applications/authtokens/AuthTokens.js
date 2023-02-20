/*
 *    Copyright 2020 floragunn GmbH
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
import { BehaviorSubject } from 'rxjs';
import { AppNavLinkStatus } from '../../../../../src/core/public';
import { AuthTokensService } from './services';
import { ELIATRASUITE_APP_CATEGORY } from '../../utils/constants';
import { appNaviFix } from '../../utils/appNaviFix';

export class AuthTokens {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ core, httpClient, configService }) {
    return async (params) => {

      // If the navigation came from "outside", e.g. from the
      // side nav, we need to tell our router to render the
      // corresponding page.
      // If not, the URL will change, but the page content will not.
      const removeExternalHistoryListener = appNaviFix(params.history);

      const [{ renderApp }] = await Promise.all([import('./app'), configService.fetchConfig()]);
      return renderApp({
        element: params.element,
        core,
        httpClient,
        configService,
        removeExternalHistoryListener,
      });
    };
  }

  setupSync({ core, httpClient, configService }) {
    try {
      this.authTokensService = new AuthTokensService(httpClient);

      core.application.register({
        id: 'security-authtokens',
        title: 'Auth Tokens',
        category: ELIATRASUITE_APP_CATEGORY,
        updater$: this.appUpdater,
        mount: this.mount({ core, httpClient, configService }),
      });
    } catch (error) {
      console.error(`AuthTokens: ${error.stack}`);
    }
  }

  start({ configService }) {
    (async () => {
      try {
        if (configService.isLoginPage()) return;

        const isEnabled = await this.authTokensService.hasUserPermissionsToAccessTheApp();

        if (!isEnabled) {
          this.appUpdater.next(() => ({
            navLinkStatus: AppNavLinkStatus.hidden,
            tooltip: 'Auth Tokens disabled',
          }));
        }
      } catch (error) {
        console.error('AuthTokens, start', error);
      }
    })();
  }
}
