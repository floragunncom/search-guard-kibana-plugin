import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const actionGroupsText = (<EuiI18n token="sg.action_groups.actionGroups.text" default="Action Groups" />);
export const actionGroupsDescription = (<EuiI18n token="sg.action_groups.actionGroups.description" default="Group your actions" />);
export const permissionsText = (<EuiI18n token="sg.action_groups.permissions.text" default="Permissions" />);
export const createActionGroupText = (<EuiI18n token="sg.action_groups.createActionGroup.text" default="Create Action Group" />);
export const updateActionGroupText = (<EuiI18n token="sg.action_groups.updateActionGroup.text" default="Update Action Group" />);
export const noActionGroupsText = (<EuiI18n token="sg.action_groups.noActionGroupsText.text" default="No Action Groups" />);
export const emptyActionGroupsTableMessageText = (
  <EuiI18n
    token="sg.action_groups.emptyActionGroupsTableMessage.text"
    default="Looks like you don&rsquo;t have any action groups. Let&rsquo;s create some!"
  />
);
export const singlePermissionsText = (<EuiI18n token="sg.action_groups.singlePermissions.text" default="Single Permissions" />);
