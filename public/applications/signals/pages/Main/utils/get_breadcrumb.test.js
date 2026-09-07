/*
 *    Copyright 2026 floragunn GmbH
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

import { APP_PATH } from '../../../utils/constants';
import getBreadcrumb from './getBreadcrumb';

describe('getBreadcrumb', () => {
  test('keeps tenant account navigation in the Tenant accounts tab', () => {
    const breadcrumbs = getBreadcrumb('define-account?id=mail&accountType=email&scope=tenant');

    expect(breadcrumbs[0].href).toBe(APP_PATH.TENANT_ACCOUNTS);
    expect(breadcrumbs[1].href).toBe('/define-account?accountType=email&id=mail&scope=tenant');
  });
});
