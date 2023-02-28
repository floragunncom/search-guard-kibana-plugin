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
 * *    Copyright 2020 floragunn GmbH
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

import queryString from 'query-string';
import { homeText } from '../../../utils/i18n/home';
import {
  internalUsersText,
  createInternalUserText,
  updateInternalUserText,
} from '../../../utils/i18n/internal_users';
import { authenticationAndAuthorizationText } from '../../../utils/i18n/auth';
import { systemStatusText, uploadLicenseText } from '../../../utils/i18n/system_status';
import { tenantsText, createTenantText, updateTenantText } from '../../../utils/i18n/tenants';
import {
  actionGroupsText,
  createActionGroupText,
  updateActionGroupText,
} from '../../../utils/i18n/action_groups';
import { rolesText, createRoleText, updateRoleText } from '../../../utils/i18n/roles';
import {
  roleMappingsText,
  createRoleMappingText,
  updateRoleMappingText,
} from '../../../utils/i18n/role_mappings';
import {
  APP_PATH,
  SYSTEM_STATUS_ACTIONS,
  TENANTS_ACTIONS,
  INTERNAL_USERS_ACTIONS,
  ACTION_GROUPS_ACTIONS,
  ROLES_ACTIONS,
  ROLE_MAPPINGS_ACTIONS,
} from '../../../utils/constants';

export default function getBreadcrumb(route) {
  const [base, queryParams] = route.split('?');
  if (!base) return null;

  const { id, action } = queryString.parse(queryParams);
  const urlParams = id && action ? `?id=${id}&action=${action}` : '';
  const uploadLicense = action === SYSTEM_STATUS_ACTIONS.UPLOAD_LICENSE;
  const updateTenant = action === TENANTS_ACTIONS.UPDATE_TENANT;
  const updateUser = action === INTERNAL_USERS_ACTIONS.UPDATE_USER;
  const updateActionGroup = action === ACTION_GROUPS_ACTIONS.UPDATE_ACTION_GROUP;
  const updateRole = action === ROLES_ACTIONS.UPDATE_ROLE;
  const updateRoleMapping = action === ROLE_MAPPINGS_ACTIONS.UPDATE_ROLE_MAPPING;

  const removePrefixSlash = (path) => path.slice(1);
  const breadcrumb = {
    '#': { text: homeText, href: APP_PATH.HOME },
    [removePrefixSlash(APP_PATH.INTERNAL_USERS)]: {
      text: internalUsersText,
      href: APP_PATH.INTERNAL_USERS,
    },
    [removePrefixSlash(APP_PATH.CREATE_INTERNAL_USER)]: [
      { text: internalUsersText, href: APP_PATH.INTERNAL_USERS },
      {
        text: updateUser ? updateInternalUserText : createInternalUserText,
        href: APP_PATH.CREATE_INTERNAL_USER + urlParams,
      },
    ],
    [removePrefixSlash(APP_PATH.AUTH)]: [
      { text: authenticationAndAuthorizationText, href: APP_PATH.AUTH },
    ],
    [removePrefixSlash(APP_PATH.SYSTEM_STATUS)]: [
      { text: systemStatusText, href: APP_PATH.SYSTEM_STATUS },
    ],
    [removePrefixSlash(APP_PATH.TENANTS)]: [{ text: tenantsText, href: APP_PATH.TENANTS }],
    [removePrefixSlash(APP_PATH.CREATE_TENANT)]: [
      { text: tenantsText, href: APP_PATH.TENANTS },
      {
        text: updateTenant ? updateTenantText : createTenantText,
        href: APP_PATH.CREATE_TENANT + urlParams,
      },
    ],
    [removePrefixSlash(APP_PATH.ACTION_GROUPS)]: [
      { text: actionGroupsText, href: APP_PATH.ACTION_GROUPS },
    ],
    [removePrefixSlash(APP_PATH.CREATE_ACTION_GROUP)]: [
      { text: actionGroupsText, href: APP_PATH.ACTION_GROUPS },
      {
        text: updateActionGroup ? updateActionGroupText : createActionGroupText,
        href: APP_PATH.CREATE_ACTION_GROUP + urlParams,
      },
    ],
    [removePrefixSlash(APP_PATH.ROLES)]: [{ text: rolesText, href: APP_PATH.ROLES }],
    [removePrefixSlash(APP_PATH.CREATE_ROLE)]: [
      { text: rolesText, href: APP_PATH.ROLES },
      {
        text: updateRole ? updateRoleText : createRoleText,
        href: APP_PATH.CREATE_ROLE + urlParams,
      },
    ],
    [removePrefixSlash(APP_PATH.ROLE_MAPPINGS)]: [
      { text: roleMappingsText, href: APP_PATH.ROLE_MAPPINGS },
    ],
    [removePrefixSlash(APP_PATH.CREATE_ROLE_MAPPING)]: [
      { text: roleMappingsText, href: APP_PATH.ROLE_MAPPINGS },
      {
        text: updateRoleMapping ? updateRoleMappingText : createRoleMappingText,
        href: APP_PATH.CREATE_ROLE_MAPPING + urlParams,
      },
    ],
  }[base];

  if (uploadLicense) {
    breadcrumb.push({
      text: uploadLicenseText,
      href: APP_PATH.SYSTEM_STATUS + `?action=${action}`,
    });
  }

  if (updateUser) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_INTERNAL_USER + urlParams });
  }
  if (updateTenant) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_TENANT + urlParams });
  }
  if (updateActionGroup) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_ACTION_GROUP + urlParams });
  }
  if (updateRole) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_ROLE + urlParams });
  }
  if (updateRoleMapping) {
    breadcrumb.push({ text: id, href: APP_PATH.CREATE_ROLE_MAPPING + urlParams });
  }

  return breadcrumb;
}
