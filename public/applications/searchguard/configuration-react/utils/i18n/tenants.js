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
import { EuiI18n } from '@elastic/eui';

export const tenantsText = <EuiI18n token="sg.tenants.tenants.text" default="Tenants" />;
export const tenantsDescription = (
  <EuiI18n token="sg.tenants.tenants.description" default="Define tenants" />
);
export const createTenantText = (
  <EuiI18n token="sg.tenants.createTenant.text" default="Create Tenant" />
);
export const updateTenantText = (
  <EuiI18n token="sg.tenants.updateTenant.text" default="Update Tenant" />
);
export const noTenantsText = <EuiI18n token="sg.tenants.noTenants.text" default="No Tenants" />;
export const emptyTenantsTableMessageText = (
  <EuiI18n
    token="sg.tenants.emptyTenantsTableMessage.text"
    default="Looks like you don&rsquo;t have any tenants. Let&rsquo;s create some!"
  />
);
export const nameAlreadyExistsText = (
  <EuiI18n token="sg.tenants.nameAlreadyExists.text" default="Name already exists" />
);
