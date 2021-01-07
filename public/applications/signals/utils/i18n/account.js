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

export const createAccountText = (
  <EuiI18n token="sg.account.createAccount.text" default="Create Account" />
);
export const updateAccountText = (
  <EuiI18n token="sg.account.updateAccount.text" default="Update Account" />
);
export const accountText = <EuiI18n token="sg.account.account.text" default="Account" />;
export const accountsText = <EuiI18n token="sg.account.accounts.text" default="Accounts" />;
export const hostText = <EuiI18n token="sg.account.host.text" default="Host" />;
export const portText = <EuiI18n token="sg.account.port.text" default="Port" />;
export const mimeLayoutText = <EuiI18n token="sg.account.mimeLayout.text" default="Mime Layout" />;
export const sessionTimeoutText = (
  <EuiI18n token="sg.account.sessionTimeout.text" default="Session Timeout" />
);
export const tlsText = <EuiI18n token="sg.account.tls.text" default="TLS" />;
export const starttlsText = <EuiI18n token="sg.account.starttls.text" default="STARTTLS" />;
export const trustAllText = <EuiI18n token="sg.account.trustAll.text" default="Trust All" />;
export const trustedHostText = (
  <EuiI18n token="sg.account.trustedHosts.text" default="Trusted Hosts" />
);
export const simulateText = <EuiI18n token="sg.account.simulate.text" default="Simulate" />;
export const debugText = <EuiI18n token="sg.account.debug.text" default="Debug" />;
export const proxyText = <EuiI18n token="sg.account.proxy.text" default="Proxy" />;
export const accountsHelpText = (
  <>
    <EuiI18n
      token="sg.accounts.help.text"
      default="Accounts are reusable profiles for external service, e.g., email, Slack, Jira, etc."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.ACCOUNTS}>
      Read more.
    </EuiLink>
  </>
);
export const accountDefaultsHelpText = (
  <>
    <EuiI18n
      token="sg.account.defaultsHelp.text"
      default="Define defaults used in emails when an email action does not configure an explicit from address. Optional."
    />{' '}
    <EuiLink target="_blank" href={DOC_LINKS.ACCOUNTS}>
      Read more.
    </EuiLink>
  </>
);
export const accountDebugHelpText = (
  <EuiI18n
    token="sg.account.debugHelp.text"
    default="Protocol data is logged to the Elasticsearch log when mails are sent"
  />
);
export const accountSimulateHelpText = (
  <EuiI18n
    token="sg.account.simulateHelp.text"
    default="Email actions render the email but won’t send it to the SMTP server. The resulting artifact or request can be viewed in the result returned by the action in the attribute request and Elasticsearch log"
  />
);
