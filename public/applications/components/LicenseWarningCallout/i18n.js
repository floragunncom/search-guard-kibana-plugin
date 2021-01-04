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
import { DOC_LINKS } from '../../utils/constants';

export const licenseCantBeLoadedText = (
  <EuiI18n
    token="sg.license_error.licenseCantBeLoaded.text"
    default="The Search Guard license information could not be loaded. Please contact your system administrator."
  />
);

export const licenseKeyIsInvalidText = (
  <>
    <EuiI18n
      token="sg.license_error.licenseKeyIsInvalid.text"
      default="The Search Guard license key is not valid for this cluster. Please contact your system administrator."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.LICENSING}>
      Licensing options.
    </EuiLink>
  </>
);

export const trialLicenseExpiresInText = (days) => (
  <EuiI18n
    token="sg.license_warning.trialLicenseExpiresIn.text"
    default={`Your trial license expires in ${days} days.`}
  />
);

export const licenseExpiresInText = (days) => (
  <EuiI18n
    token="sg.license_warning.licenseExpiresIn.text"
    default={`Your license expires in ${days} days.`}
  />
);
