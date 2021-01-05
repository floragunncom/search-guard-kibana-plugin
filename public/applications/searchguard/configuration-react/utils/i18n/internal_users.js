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

export const internalUsersText = (
  <EuiI18n token="sg.internalUsers.internalUsers.text" default="Internal Users" />
);
export const createInternalUserText = (
  <EuiI18n token="sg.internalUsers.createInternalUser.text" default="Create User" />
);
export const updateInternalUserText = (
  <EuiI18n token="sg.internalUsers.updateInternalUser.text" default="Update User" />
);
export const internalUsersDatabaseText = (
  <EuiI18n token="sg.internalUsers.internalUsersDatabase.text" default="Internal Users Database" />
);
export const internalUsersDatabaseShortDescriptionText = (
  <EuiI18n
    token="sg.internalUsers.shortDescription.text"
    default="Use it if you don't have any external authentication systems in place"
  />
);

export const searchGuardRolesText = (
  <EuiI18n token="sg.internalUsers.searchGuardRoles.text" default="Search Guard Roles" />
);
export const addRolesToConfigureAccessPermissionText = (
  <EuiI18n
    token="sg.internalUsers.addRolesToConfigureAccessPermission.text"
    default="Add roles to configure access permission"
  />
);
export const backendRolesText = (
  <EuiI18n token="sg.internalUsers.backendRoles.text" default="Backend Roles" />
);
export const userAttributesText = (
  <EuiI18n token="sg.internalUsers.userAttributes.text" default="User Attributes" />
);
export const usernameText = <EuiI18n token="sg.internalUsers.username.text" default="Username" />;
export const passwordText = <EuiI18n token="sg.internalUsers.password.text" default="Password" />;
export const repeatPasswordText = (
  <EuiI18n token="sg.internalUsers.repeatPassword.text" default="Repeat Password" />
);
export const changePasswordText = (
  <EuiI18n token="sg.internalUsers.changePassword.text" default="Change Password" />
);
export const passwordsDontMatchText = (
  <EuiI18n token="sg.internalUsers.passwordsDontMatch.text" default="Passwords don't match" />
);
export const passwordMustBeAtLeast5CharsText = (
  <EuiI18n
    token="sg.internalUsers.passwordMustBeAtLeast5Chars.text"
    default="Password must be at least 5 characters"
  />
);
export const usernameAlreadyExistsText = (
  <EuiI18n token="sg.internalUsers.usernameAlreadyExists.text" default="Username already exists" />
);
export const emptyUsersTableMessageText = (
  <EuiI18n
    token="sg.internalUsers.emptyUsersTableMessage.text"
    default="Looks like you don&rsquo;t have any users. Let&rsquo;s create some!"
  />
);
export const noUsersText = <EuiI18n token="sg.internalUsers.noUsers.text" default="No users" />;
export const complexAttributesText = (
  <EuiI18n token="sg.internalUsers.complexAttributes.text" default="Complex attributes" />
);
export const internalUsersDescriptionText = (
  <>
    <EuiI18n
      token="sg.internalUsers.description.text"
      default="Search Guard ships with an internal user database. You can use this user database if you do not have any external authentication system like LDAP or Active Directory in place. Users, their hashed passwords and roles are stored in the internal Search Guard configuration index on your cluster."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.CONFIGURE_INTERNAL_USERS_DATABASE}>
      Read more.
    </EuiLink>
  </>
);
