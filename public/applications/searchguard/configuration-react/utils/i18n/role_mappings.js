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

import React from 'react';
import { EuiI18n, EuiLink } from '@elastic/eui';
import { DOC_LINKS } from '../constants';

export const roleMappingsText = (
  <EuiI18n token="sg.role_mappings.roleMappings.text" default="Role Mappings" />
);
export const roleMappingsShortDescriptionText = (
  <EuiI18n
    token="sg.role_mappings.shortDescription.text"
    default="Map users, backend roles and hostnames to Search Guard roles"
  />
);
export const createRoleMappingText = (
  <EuiI18n token="sg.role_mappings.createRoleMapping.text" default="Create Role Mapping" />
);
export const updateRoleMappingText = (
  <EuiI18n token="sg.role_mappings.updateRoleMapping.text" default="Update Role Mapping" />
);
export const noRoleMappingsText = (
  <EuiI18n token="sg.role_mappings.noRoleMappingsText.text" default="No Role Mappings" />
);
export const emptyRoleMappingsTableMessageText = (
  <EuiI18n
    token="sg.role_mappings.emptyRoleMappingsTableMessage.text"
    default="Looks like you don&rsquo;t have any role mappings. Let&rsquo;s create some!"
  />
);

export const roleHelpText = (
  <EuiI18n token="sg.role_mappings.roleHelp.text" default="If you neead a new role," />
);
export const usersHelpText = (
  <EuiI18n token="sg.role_mappings.usersHelp.text" default="If you neead a new user," />
);
export const noCorrespondingRoleText = (
  <EuiI18n token="sg.role_mappings.noCorrespondingRole.text" default="No corresponding role" />
);
export const roleMappingsDescriptionText = (
  <>
    <EuiI18n
      token="sg.role_mappings.description.text"
      default="After a user is authenticated, Search Guard uses the role mappings to determine which Search Guard roles should be assigned to the user."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.MAPPING_USERS_ROLES}>
      Read more.
    </EuiLink>
  </>
);
