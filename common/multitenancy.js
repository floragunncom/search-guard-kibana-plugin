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

export const UI_GLOBAL_TENANT_NAME = 'Global';
export const UI_PRIVATE_TENANT_NAME = 'Private';
export const GLOBAL_TENANT_NAME = '';
export const GLOBAL_TENANT_NAME_WITH_LABEL = 'SGS_GLOBAL_TENANT';
export const PRIVATE_TENANT_NAME = '__user__';

export function tenantNameToUiTenantName(name) {
  if (!name) return UI_GLOBAL_TENANT_NAME;

  const map = new Map([
    [GLOBAL_TENANT_NAME, UI_GLOBAL_TENANT_NAME],
    [PRIVATE_TENANT_NAME, UI_PRIVATE_TENANT_NAME],
    [GLOBAL_TENANT_NAME_WITH_LABEL, UI_GLOBAL_TENANT_NAME]
  ]);

  return map.get(name) || name;
}

export function uiTenantNameToTenantName(name) {
  const map = new Map([
    [UI_GLOBAL_TENANT_NAME, GLOBAL_TENANT_NAME],
    [UI_PRIVATE_TENANT_NAME, PRIVATE_TENANT_NAME],
  ]);

  const tenantName = map.get(name);
  return tenantName === GLOBAL_TENANT_NAME ? tenantName : tenantName || name;
}
