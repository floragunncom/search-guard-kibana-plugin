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

import tenantToFormik from './tenant_to_formik';

describe('tenant to UI tenant', () => {
  test('can build UI tenant', () => {
    const resource = {
      descrtiption: 'administrator',
      static: false,
      reserved: false,
      hidden: false,
    };

    const uiResource = {
      _name: 'trex',
      descrtiption: 'administrator',
      static: false,
      reserved: false,
      hidden: false,
    };

    expect(tenantToFormik(resource, uiResource._name)).toEqual(uiResource);
  });
});
