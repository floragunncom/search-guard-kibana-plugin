import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const roleMappingsText = (<EuiI18n token="sg.role_mappings.roleMappings.text" default="Role Mappings" />);
export const roleMappingsDescription = (
  <EuiI18n token="sg.role_mappings.roleMappings.description" default="Map users, backend roles and hostnames to Search Guard roles" />
);
export const createRoleMappingText = (<EuiI18n token="sg.role_mappings.createRoleMapping.text" default="Create Role Mapping" />);
export const updateRoleMappingText = (<EuiI18n token="sg.role_mappings.updateRoleMapping.text" default="Update Role Mapping" />);
export const noRoleMappingsText = (<EuiI18n token="sg.role_mappings.noRoleMappingsText.text" default="No Role Mappings" />);
export const emptyRoleMappingsTableMessageText = (
  <EuiI18n
    token="sg.role_mappings.emptyRoleMappingsTableMessage.text"
    default="Looks like you don&rsquo;t have any role mappings. Let&rsquo;s create some!"
  />
);

export const roleHelpText = (
  <EuiI18n token="role_mappings.roleHelp.text" default="If you neead a new role," />
);
export const noCorrespondingRoleText = (
  <EuiI18n token="role_mappings.noCorrespondingRole.text" default="No corresponding role" />
);
