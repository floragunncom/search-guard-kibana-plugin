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
  <EuiI18n token="sg.common.sgLicenseNotValid.text" default="The Search Guard license key is not valid for this cluster" />
);
