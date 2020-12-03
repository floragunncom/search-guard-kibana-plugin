import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const internalUsersText = (<EuiI18n token="sg.internalUsers.internalUsers.text" default="Internal Users" />);
export const createInternalUserText = (<EuiI18n token="sg.internalUsers.createInternalUser.text" default="Create User" />);
export const updateInternalUserText = (<EuiI18n token="sg.internalUsers.updateInternalUser.text" default="Update User" />);
export const internalUsersDatabaseText = (
  <EuiI18n token="sg.internalUsers.internalUsersDatabase.text" default="Internal Users Database" />
);
export const internalUsersDatabaseDescription = (
  <EuiI18n
    token="sg.internalUsers.internalUsersDatabase.description"
    default="Use it if you don't have any external authentication systems in place"
  />
);
export const backendRolesText = (<EuiI18n token="sg.internalUsers.backendRoles.text" default="Backend Roles" />);
export const userAttributesText = (<EuiI18n token="sg.internalUsers.userAttributes.text" default="User Attributes" />);
export const usernameText = (<EuiI18n token="sg.internalUsers.username.text" default="Username" />);
export const passwordText = (<EuiI18n token="sg.internalUsers.password.text" default="Password" />);
export const repeatPasswordText = (<EuiI18n token="sg.internalUsers.repeatPassword.text" default="Repeat Password" />);
export const changePasswordText = (<EuiI18n token="sg.internalUsers.changePassword.text" default="Change Password" />);
export const passwordsDontMatchText = (<EuiI18n token="sg.internalUsers.passwordsDontMatch.text" default="Passwords don't match" />);
export const passwordMustBeAtLeast5CharsText = (
  <EuiI18n token="sg.internalUsers.passwordMustBeAtLeast5Chars.text" default="Password must be at least 5 characters" />
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
export const noUsersText = (<EuiI18n token="sg.internalUsers.noUsers.text" default="No users" />);
export const complexAttributesText = (<EuiI18n token="sg.internalUsers.complexAttributes.text" default="Complex attributes" />);
