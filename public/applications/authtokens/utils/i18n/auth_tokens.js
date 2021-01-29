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

export const homeText = <EuiI18n token="sg.auth_tokens.home.text" default="Home" />;
export const authTokensText = (
  <EuiI18n token="sg.auth_tokens.authTokens.text" default="Auth Tokens" />
);
export const authTokenText = <EuiI18n token="sg.auth_tokens.authToken.text" default="Auth Token" />;
export const createAuthTokenText = (
  <EuiI18n token="sg.auth_tokens.createAuthToken.text" default="Create Auth Token" />
);
export const authTokensShortDescriptionText = (
  <EuiI18n
    token="sg.auth_tokens.shortDescription.text"
    default="Create and manage API auth tokens that can be used to access Elasticsearch"
  />
);
export const authTokensDescriptionText = (
  <>
    <EuiI18n
      token="sg.auth_tokens.description.text"
      default="Token-based authentication allows using a unique access token for identity verification. An auth token is always associated with the user that has created it. The auth token inherits the privileges of the user and freezes them. Thus, even if the user later gains or loses privileges, the privileges available to a token remain unchanged."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.CREATE_SG_ATH_TOKENS}>
      Read more.
    </EuiLink>
  </>
);
export const noAuthTokensText = (
  <EuiI18n token="sg.auth_tokens.noAuthTokens.text" default="No Auth Tokens" />
);
export const userNameText = <EuiI18n token="sg.auth_tokens.userName.text" default="Username" />;
export const createdAtText = <EuiI18n token="sg.auth_tokens.createdAt.text" default="Created At" />;
export const expiresAtText = <EuiI18n token="sg.auth_tokens.expiresAt.text" default="Expires At" />;
export const expiresAfterText = (
  <EuiI18n token="sg.auth_tokens.expiresAfter.text" default="Expires After" />
);
export const clusterPermissionsText = (
  <EuiI18n token="sg.auth_tokens.clusterPermissions.text" default="Cluster Permissions" />
);
export const excludeClusterPermissionsText = (
  <EuiI18n
    token="sg.auth_tokens.excludeClusterPermissions.text"
    default="Exclude Cluster Permissions"
  />
);
export const indexPermissionsText = (
  <EuiI18n token="sg.auth_tokens.indexPermissions.text" default="Index Permissions" />
);
export const excludeIndexPermissionsText = (
  <EuiI18n
    token="sg.auth_tokens.excludeIndexPermissions.text"
    default="Exclude Index Permissions"
  />
);
export const freezePrivilegesText = (
  <EuiI18n token="sg.auth_tokens.freezePrivileges.text" default="Freeze privileges" />
);
export const rolesText = <EuiI18n token="sg.auth_tokens.roles.text" default="Roles" />;
export const revokedAtText = <EuiI18n token="sg.auth_tokens.revokedAt.text" default="Revoked At" />;
export const revokedTokensText = (
  <EuiI18n token="sg.auth_tokens.revokedTokens.text" default="Revoked Tokens" />
);
export const tokenIsRemovedWhenItExpiresText = (
  <EuiI18n
    token="sg.auth_tokens.tokenIsRemovedWhenItExpires.text"
    default="The token is removed when it expires"
  />
);
export const requestedPermissionsText = (
  <EuiI18n token="sg.auth_tokens.requestedPermissions.text" default="Requested Permissions" />
);
export const theFeatureIsDisabledText = (
  <>
    <EuiI18n token="sg.auth_tokens.theFeatureIsDisabled.text" default="The feature is disabled. " />
    <EuiLink target="_blank" href={DOC_LINKS.CREATE_SG_ATH_TOKENS}>
      Read more.
    </EuiLink>
  </>
);
