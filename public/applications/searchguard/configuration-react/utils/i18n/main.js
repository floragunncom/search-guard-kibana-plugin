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

export const apiAccessStateForbiddenText = (
  <EuiI18n
    token="sg.main.apiAccessStateForbidden.text"
    default="You do not have permission to access the Search Guard configuration. Please contact your System Administrator"
  />
);
export const apiAccessStateNotEnabledText = (
  <EuiI18n
    token="sg.main.apiAccessStateNotEnabled.text"
    default="The REST API module is not installed. Please contact your System Administrator"
  />
);
export const sgLicenseNotValidText = (
  <EuiI18n
    token="sg.common.sgLicenseNotValid.text"
    default="The Search Guard license key is not valid for this cluster"
  />
);
