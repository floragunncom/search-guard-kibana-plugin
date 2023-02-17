import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const rolesText = (<EuiI18n token="sp.roles.roles.text" default="Roles" />);
export const roleText = (<EuiI18n token="sp.roles.role.text" default="Role" />);
export const backendRolesText = (<EuiI18n token="sp.roles.backendRoles.text" default="Backend Roles" />);
export const rolesDescription = (
  <EuiI18n token="sp.roles.actionGroups.description" default="Configure Security Roles and their permissions" />
);
export const createRoleText = (<EuiI18n token="sp.roles.createRole.text" default="Create Role" />);
export const updateRoleText = (<EuiI18n token="sp.roles.updateRole.text" default="Update Role" />);
export const noRolesText = (<EuiI18n token="sp.roles.noRoles.text" default="No Roles" />);
export const emptyRolesTableMessageText = (
  <EuiI18n
    token="sp.roles.emptyRolesTableMessage.text"
    default="Looks like you don&rsquo;t have any roles. Let&rsquo;s create some!"
  />
);
export const clusterPermissionsText = (
  <EuiI18n token="sp.roles.clusterPermissions.text" default="Cluster Permissions" />
);
export const clusterExclusionsText = (
  <EuiI18n token="sp.roles.clusterExclusions.text" default="Cluster Exclusions" />
);
export const indexPatternsText = (
  <EuiI18n token="sp.roles.indexPatterns.text" default="Index Patterns" />
);
export const tenantPatternsText = (<EuiI18n token="sp.roles.tenantPatterns.text" default="Tenant Patterns" />);
export const noMappedUsersFoundText = (<EuiI18n token="sp.roles.noMappedUsersFound.text" default="No mapped users found" />);
export const noMappedBackendRolesFoundText = (
  <EuiI18n token="sp.roles.noMappedBackendRolesFound.text" default="No mapped backend roles found" />
);
export const noMappedHostsFoundText = (<EuiI18n token="sp.roles.noMappedHostsFound.text" default="No mapped hosts found" />);
export const tenantPermissionsText = (<EuiI18n token="sp.roles.tenantPermissions.text" default="Tenant Permissions" />);
export const indexPermissionsText = (<EuiI18n token="sp.roles.indexPermissions.text" default="Index Permissions" />);
export const indexExclusionsText = (<EuiI18n token="sp.roles.indexExclusions.text" default="Index Exclusions" />);
export const overviewText = (<EuiI18n token="sp.roles.overview.text" default="Overview" />);
export const membersText = (<EuiI18n token="sp.roles.members.text" default="Members" />);
export const usersText = (<EuiI18n token="sp.roles.users.text" default="Users" />);
export const hostsText = (<EuiI18n token="sp.roles.hosts.text" default="Hosts" />);
export const ipsText = (<EuiI18n token="sp.roles.ips.text" default="IPs" />);
export const includeOrExcludeFieldsText = (<EuiI18n token="sp.roles.includeOrExcludeFields.text" default="Include or exclude fields" />);
export const fieldLevelSecurityText = (<EuiI18n token="sp.roles.fieldLevelSecurity.text" default="Field Level Security" />);
export const anonymizeText = <EuiI18n token="sp.roles.anonymize.text" default="Anonymize" />;
export const maskTypeText = <EuiI18n token="sp.roles.maskType.text" default="Mask Type" />;
export const regularExpressionText = (
  <EuiI18n token="sp.roles.regularExpression.text" default="Regular Expression" />
);
export const hashText = <EuiI18n token="sp.roles.hash.text" default="Hash" />;
export const anonymizeHelpText = (
  <EuiI18n
    token="sp.roles.anonimizeFields.text"
    default="You can anonymize the fields with hash or regular expression."
  />
);
export const elasticsearhQueryDLSText = (<EuiI18n token="sp.roles.elasticsearhQueryDLS.text" default="Elasticsearh query DLS" />);
export const documentLevelSecurityText = (<EuiI18n token="sp.roles.documentLevelSecurity.text" default="Document Level Security" />);
export const emptyIndexPermissionsText = (
  <EuiI18n
    token="sp.roles.emptyIndexPermissions.text"
    default="Looks like you don&rsquo;t have any index permissions. Let&rsquo;s create some!"
  />
);
export const emptyIndexExclusionsText = (
  <EuiI18n
    token="sp.roles.emptyIndexExclusions.text"
    default="Looks like you don&rsquo;t have any index exclusions. Let&rsquo;s create some!"
  />
);
export const emptyTenantPermissionsText = (
  <EuiI18n
    token="sp.roles.emptyTenantPermissions.text"
    default="Looks like you don&rsquo;t have any tenant permissions. Let&rsquo;s create some!"
  />
);
export const fieldLevelSecurityDisabledText = (
  <EuiI18n token="sp.roles.fieldLevelSecurityDisabled.text" default="Field-Level Security is Disabled" />
);
export const documentLevelSecurityDisabledText = (
  <EuiI18n token="sp.roles.documentLevelSecurityDisabled.text" default="Document-Level Security is Disabled" />
);
export const multiTenancyDisabledText = (<EuiI18n token="sp.roles.multiTenancyDisabled.text" default="Multitenancy is Disabled" />);
export const anonymizedFieldsDisabledText = (
  <EuiI18n
    token="sp.roles.maskedFieldsDisabled.text"
    default="Fields anonymization feature is disabled"
  />
);
export const dlsQuerySyntaxIsInvalidText = (
  <EuiI18n token="sp.roles.dlsQuerySyntaxIsInvalid.text" default="DLS query syntax is invalid" />
);
export const permitText = <EuiI18n token="sp.roles.permit.text" default="Permit" />;
export const excludeText = <EuiI18n token="sp.roles.exclude.text" default="Exclude" />;
