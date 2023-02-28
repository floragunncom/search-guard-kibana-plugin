/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2021 floragunn GmbH
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

import { get } from 'lodash';
import { tenantNameToUiTenantName } from '../../../common/multitenancy';

export function getURLWithTenant({ tenant, url }) {
  const newURL = new URL(url);
  newURL.searchParams.set('sp_tenant', tenantNameToUiTenantName(tenant));
  return newURL.toString();
}

export function getURLWithTenantEmbeded({ tenant, url }) {
  const regex = /<iframe[^>]*src="([^"]*)"/i;
  const match = regex.exec(url);
  if (!match) return;

  // Contains the matched src, [0] contains the string where the match was found
  const origURL = match[1];
  const newURL = getURLWithTenant({ tenant, url: origURL });

  return url.replace(origURL, newURL);
}

export function shareButtonEventListener() {
  document.addEventListener('copy', () => {
    const shareButton = document.querySelector('[data-share-url]'); // Any share button
    const target = document.querySelector('body > span'); // The copy button source

    // The copy event listens to Cmd + C too, so we need to make sure
    if (target && shareButton) {
      const config = JSON.parse(sessionStorage.getItem('eliatrasuite') || '{}');
      const currentTenant = get(config, 'authinfo.user_requested_tenant');

      const origURL = target.textContent;
      let newURL = '';

      // For the iFrame urls we need to parse out the src
      if (origURL.toLowerCase().indexOf('<iframe') === 0) {
        newURL = getURLWithTenantEmbeded({ tenant: currentTenant, url: origURL });
      } else {
        newURL = getURLWithTenant({ tenant: currentTenant, url: origURL });
      }

      console.debug('multitenancy, copy share URL, origURL, newURL', origURL, newURL);

      if (newURL) {
        target.textContent = newURL;
        shareButton.setAttribute('data-share-url', newURL); // It is only for integration tests
      }
    }
  });
}
