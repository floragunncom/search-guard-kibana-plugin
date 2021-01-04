/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { EuiI18n, EuiLink } from '@elastic/eui';
import { DOC_LINKS } from '../constants';

export const authenticationAndAuthorizationText = (
  <EuiI18n token="sg.auth.shortDescription.text" default="Authentication and Authorization" />
);
export const authenticationAndAuthorizationShortDescriptionText = (
  <EuiI18n
    token="sg.auth.authenticationAndAuthorizationShortDescription.text"
    default="View the configured authentication and authorization modules"
  />
);
export const authenticationText = (
  <EuiI18n token="sg.auth.authentication.text" default="Authentication" />
);
export const authorizationText = (
  <EuiI18n token="sg.auth.authorization.text" default="Authorization" />
);
export const authenticationDescriptionText = (
  <>
    <EuiI18n
      token="sg.auth.description1.text"
      default="The Search Guard Kibana plugin offers several ways of authenticating users. Regardless of which method you choose, please make sure it matches the configured authentication type configured in Search Guard."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.AUTHENTICATION}>
      Read more.
    </EuiLink>{' '}
    <EuiI18n
      token="sg.auth.description2.text"
      default="This page is read-only to avoid cutting off the connection by accident. To configure authentication, you can use the"
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.SGADMIN}>
      sgadmin tool
    </EuiLink>{' '}
    <EuiI18n token="sg.auth.description3.text" default="or" />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.AUTHENTICATION_API}>
      API.
    </EuiLink>
  </>
);
