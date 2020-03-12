import React from 'react';
import { EuiI18n } from '@elastic/eui';


// Page
export const accountPageHeader = (<EuiI18n token="sg.account.pageHeader" default="Account Information" />);

export const accountPluginVersion = (pluginVersion) => {
  return (
    <EuiI18n
      token="sg.account.sgPluginVersion"
      default="Search Guard plugin version: {pluginVersion}"
      values={{ pluginVersion }}
    />
  );
}