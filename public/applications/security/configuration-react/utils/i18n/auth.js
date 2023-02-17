/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const authenticationAndAuthorizationText = (
  <EuiI18n
    token="sp.auth.authenticationAndAuthorization.text"
    default="Authentication and Authorization"
  />
);
export const authenticationAndAuthorizationDescription = (
  <EuiI18n
    token="sp.auth.authenticationAndAuthorization.description"
    default="View the configured authentication and authorization modules"
  />
);
export const authenticationText = (
  <EuiI18n token="sp.auth.authentication.text" default="Authentication" />
);
export const authorizationText = (
  <EuiI18n token="sp.auth.authorization.text" default="Authorization" />
);
