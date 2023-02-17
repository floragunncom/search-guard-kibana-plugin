import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const actionGroupsText = (<EuiI18n token="sp.action_groups.actionGroups.text" default="Action Groups" />);
export const actionGroupsDescription = (
  <EuiI18n token="sp.action_groups.actionGroups.description" default="Configure named groups of permissions that can be applied to roles" />
);
export const permissionsText = (<EuiI18n token="sp.action_groups.permissions.text" default="Permissions" />);
export const createActionGroupText = (<EuiI18n token="sp.action_groups.createActionGroup.text" default="Create Action Group" />);
export const updateActionGroupText = (<EuiI18n token="sp.action_groups.updateActionGroup.text" default="Update Action Group" />);
export const noActionGroupsText = (<EuiI18n token="sp.action_groups.noActionGroups.text" default="No Action Groups" />);
export const emptyActionGroupsTableMessageText = (
  <EuiI18n
    token="sp.action_groups.emptyActionGroupsTableMessage.text"
    default="Looks like you don&rsquo;t have any action groups. Let&rsquo;s create some!"
  />
);
export const singlePermissionsText = (
  <EuiI18n token="sp.action_groups.singlePermissions.text" default="Single Permissions" />
);
export const singleExclusionsText = (
  <EuiI18n token="sp.action_groups.singleExclusions.text" default="Single Exclusions" />
);
