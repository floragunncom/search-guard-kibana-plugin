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

import { GLOBAL_TENANT_NAME, tenantNameToUiTenantName, uiTenantNameToTenantName } from "./multitenancy";

test('tenantNameToUiTenantName', () => {
  expect(tenantNameToUiTenantName('qwerty')).toBe('qwerty');
  expect(tenantNameToUiTenantName('')).toBe('Global');
  expect(tenantNameToUiTenantName(GLOBAL_TENANT_NAME)).toBe('Global');
  expect(tenantNameToUiTenantName()).toBe('Global');
  expect(tenantNameToUiTenantName(null)).toBe('Global');
  expect(tenantNameToUiTenantName('__user__')).toBe('Private');
});

test('uiTenantNameToTenantName', () => {
  expect(uiTenantNameToTenantName('qwerty')).toBe('qwerty');
  expect(uiTenantNameToTenantName('Private')).toBe('__user__');
  expect(uiTenantNameToTenantName('Global')).toBe(GLOBAL_TENANT_NAME);
});
