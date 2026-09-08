import React from 'react';
import { EuiI18n } from '@elastic/eui';

export const createAccountText = (<EuiI18n token="sg.account.createAccount.text" default="Create Account" />);
export const updateAccountText = (<EuiI18n token="sg.account.updateAccount.text" default="Update Account" />);
export const readAccountText = (<EuiI18n token="sg.account.readAccount.text" default="Read Account" />);
export const accountText = (<EuiI18n token="sg.account.account.text" default="Account" />);
export const accountsText = (<EuiI18n token="sg.account.accounts.text" default="Accounts" />);
export const tenantAccountsText = (
  <EuiI18n token="sg.account.tenantAccounts.text" default="Tenant accounts" />
);
export const globalAccountsDescriptionText = (
  <EuiI18n
    token="sg.account.globalAccountsDescription.text"
    default="Global accounts are available to watches in every tenant. Editing one can affect watches across tenants."
  />
);
export const tenantAccountsDescriptionText = (
  <EuiI18n
    token="sg.account.tenantAccountsDescription.text"
    default="Tenant accounts are available only to watches in the current tenant and override same-named global accounts."
  />
);
export const accountBehaviorText = (
  <EuiI18n token="sg.account.accountBehavior.text" default="Account behavior" />
);
export const shadowsGlobalAccountText = (
  <EuiI18n
    token="sg.account.shadowsGlobalAccount.text"
    default="Shadows a global account of the same name"
  />
);
export function currentTenantText(tenantName) {
  return (
    <EuiI18n
      token="sg.account.currentTenant.text"
      default="Tenant: {tenantName}"
      values={{ tenantName }}
    />
  );
}
export const createTenantAccountTitleText = (
  <EuiI18n token="sg.account.createTenantAccountTitle.text" default="Create tenant account?" />
);
export const cloneTenantAccountTitleText = (
  <EuiI18n token="sg.account.cloneTenantAccountTitle.text" default="Clone tenant account?" />
);
export function tenantAccountShadowWarningText(accountId) {
  return (
    <EuiI18n
      token="sg.account.tenantAccountShadowWarning.text"
      default="A global account named {accountId} already exists. This tenant account will take precedence for watches in the current tenant."
      values={{ accountId }}
    />
  );
}
export const hostText = (<EuiI18n token="sg.account.host.text" default="Host" />);
export const portText = (<EuiI18n token="sg.account.port.text" default="Port" />);
export const mimeLayoutText = (<EuiI18n token="sg.account.mimeLayout.text" default="Mime Layout" />);
export const sessionTimeoutText = (<EuiI18n token="sg.account.sessionTimeout.text" default="Session Timeout" />);
export const tlsText = (<EuiI18n token="sg.account.tls.text" default="TLS" />);
export const starttlsText = (<EuiI18n token="sg.account.starttls.text" default="STARTTLS" />);
export const trustAllText = (<EuiI18n token="sg.account.trustAll.text" default="Trust All" />);
export const trustedHostText = (<EuiI18n token="sg.account.trustedHosts.text" default="Trusted Hosts" />);
export const simulateText = (<EuiI18n token="sg.account.simulate.text" default="Simulate" />);
export const debugText = (<EuiI18n token="sg.account.debug.text" default="Debug" />);
export const proxyText = (<EuiI18n token="sg.account.proxy.text" default="Proxy" />);
