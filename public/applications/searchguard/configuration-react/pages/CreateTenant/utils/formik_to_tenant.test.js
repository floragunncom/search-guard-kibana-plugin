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

import formikToTenant from './formik_to_tenant';

describe('UI tenant to tenant', () => {
  test('can build tenant', () => {
    const resource = {
      description: 'administrator',
    };

    const uiResource = {
      _name: 'trex',
      description: 'administrator',
      static: false,
      reserved: false,
      hidden: false,
    };

    expect(formikToTenant(uiResource)).toEqual(resource);
  });
});
