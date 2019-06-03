import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const homeText = (<EuiI18n token="sg.home.home.text" default="Home" />);
export const authenticationBackendsText = (<EuiI18n token="sg.home.authenticationBackends.text" default="Authentication Backends" />);
export const systemText = (<EuiI18n token="sg.common.system.text" default="System" />);
export const purgeCacheText = (<EuiI18n token="sg.home.purgeCache.text" default="Purge Cache" />);
export const purgeCacheDescription = (<EuiI18n token="sg.home.purgeCacheDescription.text" default="Purge all Search Guard caches" />);
export const permissionsAndRolesText = (
  <EuiI18n token="sg.home.permissionsAndRoles.text" default="Permissions And Roles" />
);
export const isNoAuthenticationBackendsText = (
  <EuiI18n token="sg.home.isNoEuthenticationBackends.text" default="Access to Internal Users Database is disabled" />
);
export const isNoPermissionsAndRolesText = (
  <EuiI18n token="sg.home.isNoPermissionsAndRoles.text" default="Access to Permissions and Roles is disabled" />
);
export const isNoSystemText = (
  <EuiI18n token="sg.home.isNoSystem.text" default="Access to system settings is disabled" />
);
