import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const rolesText = (<EuiI18n token="sg.roles.roles.text" default="Roles" />);
export const roleText = (<EuiI18n token="sg.roles.role.text" default="Role" />);
export const backendRolesText = (<EuiI18n token="sg.roles.backendRoles.text" default="Backend Roles" />);
export const rolesDescription = (
  <EuiI18n token="sg.roles.actionGroups.description" default="Configure Search Guard Roles and their permissions" />
);
export const createRoleText = (<EuiI18n token="sg.roles.createRole.text" default="Create Role" />);
export const updateRoleText = (<EuiI18n token="sg.roles.updateRole.text" default="Update Role" />);
export const noRolesText = (<EuiI18n token="sg.roles.noRoles.text" default="No Roles" />);
export const emptyRolesTableMessageText = (
  <EuiI18n
    token="sg.roles.emptyRolesTableMessage.text"
    default="Looks like you don&rsquo;t have any roles. Let&rsquo;s create some!"
  />
);
export const clusterPermissionsText = (
  <EuiI18n token="sg.roles.clusterPermissions.text" default="Cluster Permissions" />
);
export const clusterExclusionsText = (
  <EuiI18n token="sg.roles.clusterExclusions.text" default="Cluster Exclusions" />
);
export const indexPatternsText = (
  <EuiI18n token="sg.roles.indexPatterns.text" default="Index Patterns" />
);
export const aliasPatternsText = (
  <EuiI18n token="sg.roles.aliasPatterns.text" default="Alias Patterns" />
);
export const dataStreamPatternsText = (
  <EuiI18n token="sg.roles.dataStreamPatterns.text" default="Data Stream Patterns" />
);
export const tenantPatternsText = (<EuiI18n token="sg.roles.tenantPatterns.text" default="Tenant Patterns" />);
export const noMappedUsersFoundText = (<EuiI18n token="sg.roles.noMappedUsersFound.text" default="No mapped users found" />);
export const noMappedBackendRolesFoundText = (
  <EuiI18n token="sg.roles.noMappedBackendRolesFound.text" default="No mapped backend roles found" />
);
export const noMappedHostsFoundText = (<EuiI18n token="sg.roles.noMappedHostsFound.text" default="No mapped hosts found" />);
export const tenantPermissionsText = (<EuiI18n token="sg.roles.tenantPermissions.text" default="Tenant Permissions" />);
export const indexPermissionsText = (<EuiI18n token="sg.roles.indexPermissions.text" default="Index Permissions" />);
export const aliasPermissionsText = (<EuiI18n token="sg.roles.aliasPermissions.text" default="Alias Permissions" />);
export const dataStreamPermissionsText = (<EuiI18n token="sg.roles.dataStreamPermissions.text" default="Data Stream Permissions" />);
export const overviewText = (<EuiI18n token="sg.roles.overview.text" default="Overview" />);
export const membersText = (<EuiI18n token="sg.roles.members.text" default="Members" />);
export const usersText = (<EuiI18n token="sg.roles.users.text" default="Users" />);
export const hostsText = (<EuiI18n token="sg.roles.hosts.text" default="Hosts" />);
export const ipsText = (<EuiI18n token="sg.roles.ips.text" default="IPs" />);
export const includeOrExcludeFieldsText = (<EuiI18n token="sg.roles.includeOrExcludeFields.text" default="Include or exclude fields" />);
export const fieldLevelSecurityText = (<EuiI18n token="sg.roles.fieldLevelSecurity.text" default="Field Level Security" />);
export const anonymizeText = <EuiI18n token="sg.roles.anonymize.text" default="Anonymize" />;
export const maskTypeText = <EuiI18n token="sg.roles.maskType.text" default="Mask Type" />;
export const regularExpressionText = (
  <EuiI18n token="sg.roles.regularExpression.text" default="Regular Expression" />
);
export const hashText = <EuiI18n token="sg.roles.hash.text" default="Hash" />;
export const anonymizeHelpText = (
  <EuiI18n
    token="sg.roles.anonimizeFields.text"
    default="You can anonymize the fields with hash or regular expression."
  />
);
export const elasticsearhQueryDLSText = (<EuiI18n token="sg.roles.elasticsearhQueryDLS.text" default="Elasticsearh query DLS" />);
export const documentLevelSecurityText = (<EuiI18n token="sg.roles.documentLevelSecurity.text" default="Document Level Security" />);
export const emptyIndexPermissionsText = (
  <EuiI18n
    token="sg.roles.emptyIndexPermissions.text"
    default="Looks like you don&rsquo;t have any index permissions. Let&rsquo;s create some!"
  />
);
export const emptyAliasPermissionsText = (
  <EuiI18n
    token="sg.roles.emptyAliasPermissions.text"
    default="Looks like you don&rsquo;t have any alias permissions. Let&rsquo;s create some!"
  />
);
export const emptyDataStreamPermissionsText = (
  <EuiI18n
    token="sg.roles.emptyDataStreamPermissions.text"
    default="Looks like you don&rsquo;t have any data stream permissions. Let&rsquo;s create some!"
  />
);
export const emptyTenantPermissionsText = (
  <EuiI18n
    token="sg.roles.emptyTenantPermissions.text"
    default="Looks like you don&rsquo;t have any tenant permissions. Let&rsquo;s create some!"
  />
);
export const fieldLevelSecurityDisabledText = (
  <EuiI18n token="sg.roles.fieldLevelSecurityDisabled.text" default="Field-Level Security is Disabled" />
);
export const documentLevelSecurityDisabledText = (
  <EuiI18n token="sg.roles.documentLevelSecurityDisabled.text" default="Document-Level Security is Disabled" />
);
export const multiTenancyDisabledText = (<EuiI18n token="sg.roles.multiTenancyDisabled.text" default="Multitenancy is Disabled" />);
export const anonymizedFieldsDisabledText = (
  <EuiI18n
    token="sg.roles.maskedFieldsDisabled.text"
    default="Fields anonymization feature is disabled"
  />
);
export const dlsQuerySyntaxIsInvalidText = (
  <EuiI18n token="sg.roles.dlsQuerySyntaxIsInvalid.text" default="DLS query syntax is invalid" />
);
export const permitText = <EuiI18n token="sg.roles.permit.text" default="Permit" />;
export const excludeText = <EuiI18n token="sg.roles.exclude.text" default="Exclude" />;
