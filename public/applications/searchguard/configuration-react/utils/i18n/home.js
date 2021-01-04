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

export const homeText = <EuiI18n token="sg.home.home.text" default="Home" />;
export const authenticationBackendsText = (
  <EuiI18n token="sg.home.authenticationBackends.text" default="Authentication Backends" />
);
export const systemText = <EuiI18n token="sg.common.system.text" default="System" />;
export const purgeCacheText = <EuiI18n token="sg.home.purgeCache.text" default="Purge Cache" />;
export const purgeCacheDescription = (
  <EuiI18n token="sg.home.purgeCacheDescription.text" default="Purge all Search Guard caches" />
);
export const permissionsAndRolesText = (
  <EuiI18n token="sg.home.permissionsAndRoles.text" default="Permissions And Roles" />
);
export const isNoAuthenticationBackendsText = (
  <EuiI18n
    token="sg.home.isNoEuthenticationBackends.text"
    default="Access to Internal Users Database is disabled"
  />
);
export const isNoPermissionsAndRolesText = (
  <EuiI18n
    token="sg.home.isNoPermissionsAndRoles.text"
    default="Access to Permissions and Roles is disabled"
  />
);
export const isNoSystemText = (
  <EuiI18n token="sg.home.isNoSystem.text" default="Access to system settings is disabled" />
);
export const sgDescriptionText = (
  <>
    <EuiI18n
      token="sg.home.description.text"
      default="Search Guard secures Elasticsearch cluster applicating different industry-standard authentication techniques, like Kerberos, LDAP / Active Directory, JSON web tokens, TLS certificates, and Proxy authentication / SSO (SAML, OpenId, JWT). Main concepts."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.MAIN_CONCEPTS}>
      Main concepts.
    </EuiLink>
  </>
);
