import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const apiAccessStateForbiddenText = (
  <EuiI18n
    token="sp.main.apiAccessStateForbidden.text"
    default="You do not have permission to access the Security configuration. Please contact your System Administrator"
  />
);
export const apiAccessStateNotEnabledText = (
  <EuiI18n
    token="sp.main.apiAccessStateNotEnabled.text"
    default="The REST API module is not installed. Please contact your System Administrator"
  />
);
export const sgLicenseNotValidText = (
  <EuiI18n token="sp.common.sgLicenseNotValid.text" default="The Eliatra Suite license key is not valid for this cluster" />
);
