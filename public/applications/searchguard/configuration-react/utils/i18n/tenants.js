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

export const tenantsText = <EuiI18n token="sg.tenants.tenants.text" default="Tenants" />;
export const tenantsShortDescriptionText = (
  <EuiI18n token="sg.tenants.shortDescription.text" default="Define tenants" />
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
