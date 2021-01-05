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

export const actionGroupsText = (
  <EuiI18n token="sg.action_groups.actionGroups.text" default="Action Groups" />
);
export const actionGroupsShortDescriptionText = (
  <EuiI18n
    token="sg.action_groups.shortDescription.text"
    default="Configure named groups of permissions that can be applied to roles"
  />
);
export const permissionsText = (
  <EuiI18n token="sg.action_groups.permissions.text" default="Permissions" />
);
export const createActionGroupText = (
  <EuiI18n token="sg.action_groups.createActionGroup.text" default="Create Action Group" />
);
export const updateActionGroupText = (
  <EuiI18n token="sg.action_groups.updateActionGroup.text" default="Update Action Group" />
);
export const noActionGroupsText = (
  <EuiI18n token="sg.action_groups.noActionGroups.text" default="No Action Groups" />
);
export const emptyActionGroupsTableMessageText = (
  <EuiI18n
    token="sg.action_groups.emptyActionGroupsTableMessage.text"
    default="Looks like you don&rsquo;t have any action groups. Let&rsquo;s create some!"
  />
);
export const singlePermissionsText = (
  <EuiI18n token="sg.action_groups.singlePermissions.text" default="Single Permissions" />
);
export const singleExclusionsText = (
  <EuiI18n token="sg.action_groups.singleExclusions.text" default="Single Exclusions" />
);
export const actionGroupsDescriptionText = (
  <>
    <EuiI18n
      token="sg.action_groups.description.text"
      default="An action group is simply a collection of permissions with a telling name."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.ACTION_GROUPS}>
      Read more.
    </EuiLink>
  </>
);
export const actionGroupMayIncludeOtherActionGroupsText = (
  <EuiI18n
    token="sg.action_groups.actionGroupMayIncludeOtherActionGroups.text"
    default="Action group may include other action groups"
  />
);
export const permissionLevelText = (
  <EuiI18n token="sg.action_groups.permissionLevel.text" default="Permission level" />
);
