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

import { AppNavLinkStatus } from '../../../../../src/core/public';
import { SEARCHGUARD_APP_CATEGORY } from '../../utils/constants';
import {
  SEARCHGUARD_ACCOUNTINFO_APP_ID,
  SEARCHGUARD_ACCOUNTINFO_APP_TITLE,
} from './utils/constants';

export class AccountInfo {
  constructor(coreContext) {
    this.coreContext = coreContext;
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
        mount: this.mount({ httpClient, configService }),
        // We show the app in the Kinana header user menu
        navLinkStatus: AppNavLinkStatus.hidden,
      });
    } catch (error) {
      console.error(`Accountinfo: ${error.toString()} ${error.stack} `);
    }
  }
}
