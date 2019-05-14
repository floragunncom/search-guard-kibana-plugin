import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const tenantsText = (<EuiI18n token="sg.tenants.tenants.text" default="Tenants" />);
export const tenantsDescription = (<EuiI18n token="sg.tenants.tenants.description" default="Define tenants" />);
export const createTenantText = (<EuiI18n token="sg.tenants.createTenant.text" default="Create Tenant" />);
export const updateTenantText = (<EuiI18n token="sg.tenants.updateTenant.text" default="Update Tenant" />);
export const noTenantsText = (<EuiI18n token="sg.tenants.noTenants.text" default="No Tenants" />);
export const emptyTenantsTableMessageText = (
  <EuiI18n
    token="sg.tenants.emptyTenantsTableMessage.text"
    default="Looks like you don&rsquo;t have any tenants. Let&rsquo;s create some!"
  />
);
