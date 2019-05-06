import React from 'react';
import { EuiI18n } from '@elastic/eui';

// Home
export const i18nHomeText = (<EuiI18n token="sgHome.text" default="Home" />);
export const i18nAuthenticationBackendsText = (<EuiI18n token="sgAuthenticationBackends.text" default="Authentication Backends" />);

// All app
export const i18nSaveText = (<EuiI18n token="sgSave.text" default="Save" />);
export const i18nCancelText = (<EuiI18n token="sgCancel.text" default="Cancel" />);

// Internal Users
export const i18nInternalUsersText = (<EuiI18n token="sgInternalUsers.text" default="Internal Users" />);
export const i18nCreateInternalUserText = (<EuiI18n token="sgCreateInternalUser.text" default="Create User" />);
export const i18nUpdateInternalUserText = (<EuiI18n token="sgUpdateInternalUser.text" default="Update User" />);
export const i18nInternalUsersDatabaseText = (<EuiI18n token="sgInternalUsersDatabase.text" default="Internal Users Database" />);
export const i18nInternalUsersDatabaseDescription = (
  <EuiI18n token="sgInternalUsersDatabase.description" default="Use it if you do not have any external authentication system" />
);
