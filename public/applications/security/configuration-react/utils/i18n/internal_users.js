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

export const internalUsersText = (
  <EuiI18n token="sp.internalUsers.internalUsers.text" default="Internal Users" />
);
export const createInternalUserText = (
  <EuiI18n token="sp.internalUsers.createInternalUser.text" default="Create User" />
);
export const updateInternalUserText = (
  <EuiI18n token="sp.internalUsers.updateInternalUser.text" default="Update User" />
);
export const internalUsersDatabaseText = (
  <EuiI18n token="sp.internalUsers.internalUsersDatabase.text" default="Internal Users Database" />
);
export const internalUsersDatabaseDescription = (
  <EuiI18n
    token="sp.internalUsers.internalUsersDatabase.description"
    default="Use it if you don't have any external authentication systems in place"
  />
);

export const internalRolesText = (
  <EuiI18n token="sp.internalUsers.internalRoles.text" default="Internal Roles" />
);
export const backendRolesText = (
  <EuiI18n token="sp.internalUsers.backendRoles.text" default="Backend Roles" />
);
export const userAttributesText = (
  <EuiI18n token="sp.internalUsers.userAttributes.text" default="User Attributes" />
);
export const usernameText = <EuiI18n token="sp.internalUsers.username.text" default="Username" />;
export const passwordText = <EuiI18n token="sp.internalUsers.password.text" default="Password" />;
export const repeatPasswordText = (
  <EuiI18n token="sp.internalUsers.repeatPassword.text" default="Repeat Password" />
);
export const changePasswordText = (
  <EuiI18n token="sp.internalUsers.changePassword.text" default="Change Password" />
);
export const passwordsDontMatchText = (
  <EuiI18n token="sp.internalUsers.passwordsDontMatch.text" default="Passwords don't match" />
);
export const passwordMustBeAtLeast5CharsText = (
  <EuiI18n
    token="sp.internalUsers.passwordMustBeAtLeast5Chars.text"
    default="Password must be at least 5 characters"
  />
);
export const usernameAlreadyExistsText = (
  <EuiI18n token="sp.internalUsers.usernameAlreadyExists.text" default="Username already exists" />
);
export const emptyUsersTableMessageText = (
  <EuiI18n
    token="sp.internalUsers.emptyUsersTableMessage.text"
    default="Looks like you don&rsquo;t have any users. Let&rsquo;s create some!"
  />
);
export const noUsersText = <EuiI18n token="sp.internalUsers.noUsers.text" default="No users" />;
export const complexAttributesText = (
  <EuiI18n token="sp.internalUsers.complexAttributes.text" default="Complex attributes" />
);
