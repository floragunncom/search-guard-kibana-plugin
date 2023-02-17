/*
 *    Copyright 2021 floragunn GmbH
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

export const accountInformationText = (
  <EuiI18n token="sp.accountinfo.accountInformation" default="Account Information" />
);

export const userNameHeader = <EuiI18n token="sp.accountinfo.username_header" default="Username" />;
export const sgRolesHeader = (
  <EuiI18n token="sp.accountinfo.sgRoles_header" default="Security roles" />
);

export const sgRolesEmpty = (
  <EuiI18n
    token="sp.accountinfo.sgRoles_empty"
    default="No roles found, please check the role mapping for this user."
  />
);

export const backendRolesHeader = (
  <EuiI18n token="sp.accountinfo.backendRoles_header" default="Backend roles" />
);

export const backendRolesEmpty = (
  <EuiI18n token="sp.accountinfo.backendRoles_empty" default="No backend roles found." />
);
export const accountPluginVersion = (pluginVersion) => {
  return (
    <EuiI18n
      token="sp.accountinfo.sgPluginVersion"
      default="Eliatra Suite plugin version: {pluginVersion}"
      values={{ pluginVersion }}
    />
  );
};
