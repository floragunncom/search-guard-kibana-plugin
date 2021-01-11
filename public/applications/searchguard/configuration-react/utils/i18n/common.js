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

export * from '../../../../utils/i18n/common';

export const forbiddenCharsText = (
  <EuiI18n token="sg.common.forbiddenChars.text" default="Forbidden characters: . *" />
);

export const indicesPermissionsPrefixErrorText = (
  <EuiI18n
    token="sg.roles.inicesPermissionsPrefixError.text"
    default="Indices permissions prefix is indices:"
  />
);

export const clusterPermissionsPrefixErrorText = (
  <EuiI18n
    token="sg.roles.clusterPermissionsPrefixError.text"
    default="Cluster permissions prefix is cluster:"
  />
);

export const permissionsPrefixErrorText = (
  <EuiI18n
    token="sg.roles.permissionsPrefixError.text"
    default="Permissions prefixes are cluster: and indices:"
  />
);
