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
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';

export const SEARCHGUARD_ACCOUNTINFO_APP_ID = 'searchguard-accountinfo';
export const SEARCHGUARD_ACCOUNTINFO_APP_TITLE = 'Account Info';

export class AccountInfo {
  constructor(coreContext) {
    this.coreContext = coreContext;
    this.appUpdater = new BehaviorSubject(() => ({}));
  }

  mount({ configService, httpClient }) {
    return async (params) => {
      const [{ renderApp }] = await Promise.all([import('./npstart'), configService.init()]);

      if (configService.get('searchguard.accountinfo.enabled')) {
        return renderApp({
          element: params.element,
          httpClient,
          configService,
        });
      }
    };
  }

  setupSync({ core, httpClient, configService }) {
    try {
      core.application.register({
        id: SEARCHGUARD_ACCOUNTINFO_APP_ID,
        title: SEARCHGUARD_ACCOUNTINFO_APP_TITLE,
        category: SEARCHGUARD_APP_CATEGORY,
        updater$: this.appUpdater,
        mount: this.mount({ httpClient, configService }),
      });
    } catch (error) {
      console.error(`Accountinfo: ${error.toString()} ${error.stack} `);
    }
  }

  start({ configService }) {
    try {
      if (!configService.get('searchguard.accountinfo.enabled')) {
        this.appUpdater.next(() => ({
          navLinkStatus: AppNavLinkStatus.disabled,
          tooltip: 'Accountinfo disabled',
        }));
      }
    } catch (error) {
      console.error(`Accountinfo: ${error.toString()} ${error.stack} `);
    }
  }
}
