import React from 'react';
import {EuiI18n, EuiText} from '@elastic/eui';


// Page
export const mtPageHeader = (<EuiI18n token="sg.mt.pageHeader" default="Select Tenant" />);

// Error
export const mtConfigErrorHeader = (<EuiI18n token="sg.mt.configErrorHeader" default="Configuration error" />);


// Tenant related
export const readWriteLabel = (<EuiI18n token="sg.mt.readWrite" default="Read / Write" />);
export const readOnlyLabel = (<EuiI18n token="sg.mt.readOnly" default="Read only" />);
export const globalTenantLabel = (<EuiI18n token="sg.mt.globalLabel" default="Global" />);
export const privateTenantLabel = (<EuiI18n token="sg.mt.privateLabel" default="Private" />);

// Table
export const mtActiveTenantLabel = (tenantName) => {
  return (
    <EuiI18n
      token="sg.mt.activeTenantHeader"
      default="Active tenant: {tenantName}"
      values={{ tenantName }}
    />
  );
}

export const nameHeader = (<EuiI18n token="sg.mt.col.name" default="Name" />);
export const permissionsHeader = (<EuiI18n token="sg.mt.col.permissions" default="Permissions" />);
export const selectTenantButtonLabel = (<EuiI18n token="sg.mt.btn.select" default="Select" />);
export const selectedTenantButtonLabel = (<EuiI18n token="sg.mt.btn.selected" default="Selected" />);
export const showDashboardLabel = (<EuiI18n token="sg.mt.btn.dashboard" default="Show dashboard" />);
export const showVisualizationLabel = (<EuiI18n token="sg.mt.btn.visualization" default="Show visualization" />);

// Roles flyout
export const mtRolesFlyoutTitle = (userName) => {
  return (
    <EuiI18n
      token="sg.mt.rolesFlyoutTitle"
      default="Roles for user {userName}"
      values={{ userName }}
    />
  );
}