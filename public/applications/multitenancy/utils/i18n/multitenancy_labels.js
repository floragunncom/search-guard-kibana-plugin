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

// Page
export const mtPageHeader = (<EuiI18n token="sg.mt.pageHeader" default="Select Tenant" />);

// Error
export const mtConfigErrorHeader = (<EuiI18n token="sg.mt.configErrorHeader" default="Configuration error" />);


// Tenant related
export const readWriteLabel = (<EuiI18n token="sg.mt.readWrite" default="read/write" />);
export const readOnlyLabel = (<EuiI18n token="sg.mt.readOnly" default="read only" />);
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
};

export const tenantsDescriptionText = (
  <>
    <EuiI18n
      token="sg.tenants.description.text"
      default="A Kibana tenant is a named container for storing saved objects. A tenant can be assigned to one or more Search Guard roles. The role can have read-write or read-only access to the tenant and thus the saved objects in it. A Kibana user selects the tenant that he or she wants to work with. Search Guard ensures that the saved objects are placed in the selected tenant."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.MULTITENANCY}>
      Read more.
    </EuiLink>
  </>
);
