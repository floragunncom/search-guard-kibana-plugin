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
import { getSelectedTabId } from './get_selected_tab_id';

describe('getSelectedTabId', () => {
  test.each([
    [APP_PATH.ACCOUNTS, APP_PATH.ACCOUNTS],
    [APP_PATH.TENANT_ACCOUNTS, APP_PATH.TENANT_ACCOUNTS],
    [APP_PATH.WATCHES, APP_PATH.WATCHES],
  ])('selects %s exactly', (pathname, selectedTabId) => {
    expect(getSelectedTabId(pathname)).toBe(selectedTabId);
  });
});
