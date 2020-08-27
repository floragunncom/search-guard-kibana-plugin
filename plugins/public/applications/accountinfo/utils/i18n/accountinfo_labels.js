import React from 'react';
import { EuiI18n } from '@elastic/eui';

// Page
export const pageHeader = (
  <EuiI18n token="sg.accountinfo.pageHeader" default="Account Information" />
);

export const userNameHeader = <EuiI18n token="sg.accountinfo.username_header" default="Username" />;
export const sgRolesHeader = (
  <EuiI18n token="sg.accountinfo.sgRoles_header" default="Search Guard roles" />
);

export const sgRolesEmpty = (
  <EuiI18n
    token="sg.accountinfo.sgRoles_empty"
    default="No Search Guard roles found, please check the role mapping for this user."
  />
);

export const backendRolesHeader = (
  <EuiI18n token="sg.accountinfo.backendRoles_header" default="Backend roles" />
);

export const backendRolesEmpty = (
  <EuiI18n token="sg.accountinfo.backendRoles_empty" default="No backend roles found." />
);
export const accountPluginVersion = pluginVersion => {
  return (
    <EuiI18n
      token="sg.accountinfo.sgPluginVersion"
      default="Search Guard plugin version: {pluginVersion}"
      values={{ pluginVersion }}
    />
  );
};
