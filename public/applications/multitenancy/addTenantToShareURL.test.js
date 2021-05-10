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

import { getURLWithTenant, getURLWithTenantEmbeded } from './addTenantToShareURL';

describe('addTenantToShareURL', () => {
  test('getURLWithTenant', () => {
    const origURL = 'https://kibana.example.com:5601/goto/c80be719ea4c4c5bdc3ade1d7ed785f0';
    let newURL =
      'https://kibana.example.com:5601/goto/c80be719ea4c4c5bdc3ade1d7ed785f0?sg_tenant=Global';

    expect(getURLWithTenant({ url: origURL, tenant: '' })).toBe(newURL);
    expect(getURLWithTenant({ url: origURL, tenant: undefined })).toBe(newURL);

    newURL =
      'https://kibana.example.com:5601/goto/c80be719ea4c4c5bdc3ade1d7ed785f0?sg_tenant=Private';

    expect(getURLWithTenant({ url: origURL, tenant: '__user__' })).toBe(newURL);

    newURL =
      'https://kibana.example.com:5601/goto/c80be719ea4c4c5bdc3ade1d7ed785f0?sg_tenant=someone';

    expect(getURLWithTenant({ url: origURL, tenant: 'someone' })).toBe(newURL);
  });

  test('get embeded URL', () => {
    const tenantName = 'someone';
    const origURL =
      '<iframe src="https://kibana.example.com:5601/goto/49961fa054b77c8ab69f65772bc82b2a" height="600" width="800"></iframe>';
    const newURL = `<iframe src="https://kibana.example.com:5601/goto/49961fa054b77c8ab69f65772bc82b2a?sg_tenant=${tenantName}" height="600" width="800"></iframe>`;

    expect(getURLWithTenantEmbeded({ url: origURL, tenant: tenantName })).toBe(newURL);
  });
});
