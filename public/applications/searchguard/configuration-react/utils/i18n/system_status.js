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

export const systemStatusText = (
  <EuiI18n token="sg.system_status.systemStatus.text" default="System Status" />
);
export const systemStatusShortDescriptionText = (
  <EuiI18n
    token="sg.system_status.shortdDescription.text"
    default="View the Search Guard license and all installed modules"
  />
);
export const uploadLicenseText = (
  <EuiI18n token="sg.system_status.uploadLicenseText.text" default="Upload License" />
);
export const uploadLicenseFileText = (
  <EuiI18n token="sg.system_status.uploadLicenseText.text" default="Upload License file" />
);
export const uploadFileformatsText = (
  <EuiI18n
    token="sg.system_status.fileformats.text"
    default="Supported file formats: .txt and .lic"
  />
);
export const importText = <EuiI18n token="sg.common.import.text" default="Import" />;
export const licenseStringText = (
  <EuiI18n token="sg.common.licenseString.text" default="License string" />
);
export const licenseWasUploadedSuccessfullyText = (
  <EuiI18n
    token="sg.common.licenseWasUploadedSuccessfully.text"
    default="License was uploaded successfully"
  />
);
export const selectOrDragAndDropLicenseFileText = (
  <EuiI18n
    token="sg.common.selectOrDragAndDropLicenseFile.text"
    default="Select or drag and drop a license file"
  />
);
export const licenseFileCantBeImportedText = (
  <EuiI18n
    token="sg.common.licenseFileCantBeImported.text"
    default="Something went wrong with the uploaded file. Please paste the content of the file into the text field."
  />
);

// The following constant names are used dynamically. Make sure the page is not broken if you change them.
export const name = <EuiI18n token="sg.system_status.name.text" default="Name" />;
export const version = <EuiI18n token="sg.system_status.version.text" default="Version" />;
export const isEnterprise = (
  <EuiI18n token="sg.system_status.isEnterprise.text" default="Is Enterprise Module" />
);
export const systemStatus = (
  <EuiI18n token="sg.system_status.systemStatus.text" default="System Status" />
);
export const cluster = <EuiI18n token="sg.system_status.cluster.text" default="Cluster" />;
export const license = <EuiI18n token="sg.system_status.license.text" default="License" />;
export const activeModules = (
  <EuiI18n token="sg.system_status.activeModules.text" default="Active Modules" />
);
export const clusterName = (
  <EuiI18n token="sg.system_status.clusterName.text" default="Cluster Name" />
);
export const nodes = <EuiI18n token="sg.system_status.nodes.text" default="Nodes" />;
export const type = <EuiI18n token="sg.system_status.type.text" default="Type" />;
export const issuedTo = <EuiI18n token="sg.system_status.issuedTo.text" default="Issued To" />;
export const UUID = <EuiI18n token="sg.system_status.UUID.text" default="UUID" />;
export const startDate = <EuiI18n token="sg.system_status.startDate.text" default="Start Date" />;
export const endDate = <EuiI18n token="sg.system_status.endDate.text" default="End Date" />;
export const daysLeft = <EuiI18n token="sg.system_status.daysLeft.text" default="Days Left" />;
export const isValid = <EuiI18n token="sg.system_status.isValid.text" default="Is Valid" />;
export const isExpired = <EuiI18n token="sg.system_status.isExpired.text" default="Is Expired" />;
export const kibanaPlugin = (
  <EuiI18n token="sg.system_status.kibanaPlugin.text" default="Kibana Plugin" />
);
export const auditLogging = (
  <EuiI18n token="sg.system_status.auditLogging.text" default="Audit Logging" />
);
export const documentAndFieldLevelSecurity = (
  <EuiI18n
    token="sg.system_status.documentAndFieldLevelSecurity.text"
    default="Document- And Field-Level Security"
  />
);
export const HTTPBasicAuthenticator = (
  <EuiI18n
    token="sg.system_status.HTTPBasicAuthenticator.text"
    default="HTTP Basic Authenticator"
  />
);
export const internalUsersAuthenticationBackend = (
  <EuiI18n
    token="sg.system_status.internalUsersAuthenticationBackend.text"
    default="Internal Users Authentication Backend"
  />
);
export const kibanaMultitenancy = (
  <EuiI18n token="sg.system_status.kibanaMultitenancy.text" default="Kibana Multitenancy" />
);
export const RESTManagementAPI = (
  <EuiI18n token="sg.system_status.RESTManagementAPI.text" default="REST Management API" />
);
export const licensingDescriptionText = (
  <>
    <EuiI18n
      token="sg.system_status.licensing.text"
      default="Search Guard offers several licensing models: community, enterprise, and compliance."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.LICENSING}>
      Read more.
    </EuiLink>
  </>
);
